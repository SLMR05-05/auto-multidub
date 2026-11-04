package com.travelguide.service;

import com.travelguide.dto.CommonDtos.PageResponse;
import com.travelguide.dto.PoiDtos;
import com.travelguide.dto.PoiDtos.*;
import com.travelguide.dto.SyncDtos.SyncPoi;
import com.travelguide.entity.*;
import com.travelguide.repository.*;
import com.travelguide.util.CodeUtils;
import com.travelguide.util.GeoUtils;
import com.travelguide.util.LanguageCatalog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PoiService {

    private final PoiRepository pois;
    private final PoiTranslationRepository translations;
    private final PoiAudioRepository audios;
    private final PoiImageRepository images;
    private final TourRepository tours;
    private final TourPoiRepository tourPois;
    private final QrCodeRepository qrCodes;
    private final WardRepository wards;
    private final BusStopRepository busStops;
    private final DataVersionService versions;
    private final AuditService audit;

    public PoiService(PoiRepository pois,
                      PoiTranslationRepository translations,
                      PoiAudioRepository audios,
                      PoiImageRepository images,
                      TourRepository tours,
                      TourPoiRepository tourPois,
                      QrCodeRepository qrCodes,
                      WardRepository wards,
                      BusStopRepository busStops,
                      DataVersionService versions,
                      AuditService audit) {
        this.pois = pois;
        this.translations = translations;
        this.audios = audios;
        this.images = images;
        this.tours = tours;
        this.tourPois = tourPois;
        this.qrCodes = qrCodes;
        this.wards = wards;
        this.busStops = busStops;
        this.versions = versions;
        this.audit = audit;
    }

    // ------------------------------------------------------------------
    // CMS operations
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<AdminResponse> adminSearch(String search, PoiStatus status, Long wardId,
                                                   String missingTranslationLang, String missingAudioLang,
                                                   int page, int size) {
        String translationLang = blankToNull(missingTranslationLang);
        String audioLang = blankToNull(missingAudioLang);
        Page<Poi> result = pois.search(blankToNull(search), status, wardId, translationLang, audioLang,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                        Sort.by(Sort.Direction.DESC, "updatedAt")));

        List<Long> ids = result.getContent().stream().map(Poi::getId).toList();
        Map<Long, Integer> translationCounts = groupedCounts(ids, translations::countGroupedByPoiIds);
        Map<Long, Integer> audioCounts = groupedCounts(ids, audios::countGroupedByPoiIds);
        Map<Long, Integer> imageCounts = groupedCounts(ids, images::countGroupedByPoiIds);
        return PageResponse.of(result.map(poi -> toAdmin(poi,
                translationCounts.getOrDefault(poi.getId(), 0),
                audioCounts.getOrDefault(poi.getId(), 0),
                imageCounts.getOrDefault(poi.getId(), 0))));
    }

    @Transactional(readOnly = true)
    public AdminResponse adminGet(Long id) {
        return toAdmin(find(id));
    }

    @Transactional
    public AdminResponse create(PoiRequest request) {
        Poi poi = new Poi();
        poi.setCode(uniqueCode(request.code(), request.name()));
        poi.setName(request.name().trim());
        applyGeography(poi, request.wardId(), request.busStopId());
        poi.setLatitude(request.latitude());
        poi.setLongitude(request.longitude());
        poi.setRadiusMeters(request.radiusMeters());
        poi.setPriority(request.priority());
        poi.setCooldownMinutes(request.cooldownMinutes());
        poi.setStatus(PoiStatus.DRAFT);
        poi = pois.save(poi);
        audit.record("CREATE", "POI", poi.getId(), null, toAdmin(poi));
        return toAdmin(poi);
    }

    @Transactional
    public AdminResponse update(Long id, PoiRequest request) {
        Poi poi = find(id);
        AdminResponse before = toAdmin(poi);

        if (request.code() != null && !request.code().isBlank()
                && !request.code().trim().equals(poi.getCode())) {
            if (pois.existsByCode(request.code().trim())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "POI code already exists");
            }
            poi.setCode(request.code().trim());
        }
        poi.setName(request.name().trim());
        applyGeography(poi, request.wardId(), request.busStopId());
        poi.setLatitude(request.latitude());
        poi.setLongitude(request.longitude());
        poi.setRadiusMeters(request.radiusMeters());
        poi.setPriority(request.priority());
        poi.setCooldownMinutes(request.cooldownMinutes());

        touchIfPublished(poi);
        poi = pois.save(poi);
        AdminResponse after = toAdmin(poi);
        audit.record("UPDATE", "POI", id, before, after);
        return after;
    }

    @Transactional
    public void archive(Long id, boolean force) {
        Poi poi = find(id);
        if (poi.getStatus() == PoiStatus.ARCHIVED) {
            return;
        }
        if (!force) {
            if (tourPois.existsByPoiId(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "POI belongs to a tour; remove it from the tour or use force=true");
            }
            if (qrCodes.existsByPoiIdAndActiveTrue(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "POI has active QR codes; disable them or use force=true");
            }
        }
        AdminResponse before = toAdmin(poi);
        poi.setStatus(PoiStatus.ARCHIVED);
        if (poi.isPreviouslyPublished()) {
            poi.setVersion(versions.next());
        }
        pois.save(poi);
        audit.record("ARCHIVE", "POI", id, before, toAdmin(poi));
    }

    @Transactional
    public PublishResult publish(Long id) {
        Poi poi = find(id);
        List<PublishIssue> issues = validateForPublish(poi);
        if (!issues.isEmpty()) {
            return new PublishResult(versions.current(), 0, issues);
        }
        long version = versions.next();
        poi.setStatus(PoiStatus.PUBLISHED);
        poi.setPreviouslyPublished(true);
        poi.setVersion(version);
        pois.save(poi);
        audit.record("PUBLISH", "POI", id, null, Map.of("version", version, "status", "PUBLISHED"));
        return new PublishResult(version, 1, List.of());
    }

    /**
     * Re-validates every published POI and bumps the global data version once.
     * This is the CMS "Xuất bản" action.
     */
    @Transactional
    public PublishResult publishAll() {
        List<Poi> published = pois.findByStatusInOrderByNameAsc(List.of(PoiStatus.PUBLISHED));
        List<PublishIssue> issues = new ArrayList<>();
        for (Poi poi : published) {
            issues.addAll(validateForPublish(poi));
        }
        if (!issues.isEmpty()) {
            return new PublishResult(versions.current(), 0, issues);
        }
        long version = versions.next();
        for (Poi poi : published) {
            poi.setVersion(version);
        }
        pois.saveAll(published);
        audit.record("PUBLISH_ALL", "SYSTEM", null, null, Map.of("version", version, "poiCount", published.size()));
        return new PublishResult(version, published.size(), List.of());
    }

    @Transactional(readOnly = true)
    public List<TranslationResponse> listTranslations(Long poiId) {
        find(poiId);
        return translations.findByPoiId(poiId).stream()
                .sorted(Comparator.comparing(PoiTranslation::getLanguageCode))
                .map(this::toTranslationResponse)
                .toList();
    }

    @Transactional
    public TranslationResponse upsertTranslation(Long poiId, String languageCode, TranslationRequest request) {
        Poi poi = find(poiId);
        String language = normalizeLanguage(languageCode);
        PoiTranslation translation = translations.findByPoiIdAndLanguageCode(poiId, language)
                .orElseGet(() -> {
                    PoiTranslation created = new PoiTranslation();
                    created.setPoi(poi);
                    created.setLanguageCode(language);
                    return created;
                });
        translation.setName(request.name().trim());
        translation.setDescription(request.description());
        translation.setTtsScript(request.ttsScript());
        translation = translations.save(translation);
        touchIfPublished(poi);
        audit.record("UPSERT_TRANSLATION", "POI", poiId, null,
                Map.of("language", language, "name", translation.getName()));
        return toTranslationResponse(translation);
    }

    @Transactional
    public void deleteTranslation(Long poiId, String languageCode) {
        Poi poi = find(poiId);
        String language = normalizeLanguage(languageCode);
        PoiTranslation translation = translations.findByPoiIdAndLanguageCode(poiId, language)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Translation not found"));
        if ("vi".equals(language)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vietnamese is the base language and cannot be deleted");
        }
        translations.delete(translation);
        touchIfPublished(poi);
        audit.record("DELETE_TRANSLATION", "POI", poiId, Map.of("language", language), null);
    }

    @Transactional(readOnly = true)
    public CoverageResponse coverage(Long poiId) {
        Poi poi = find(poiId);
        Map<String, PoiTranslation> translationMap = translations.findByPoiId(poiId).stream()
                .collect(Collectors.toMap(PoiTranslation::getLanguageCode, Function.identity(), (a, b) -> a));
        Map<String, PoiAudio> audioMap = audios.findByPoiIdOrderByLanguageCodeAsc(poiId).stream()
                .collect(Collectors.toMap(PoiAudio::getLanguageCode, Function.identity(), (a, b) -> a));
        List<CoverageCell> cells = LanguageCatalog.codes().stream()
                .map(lang -> {
                    PoiTranslation translation = translationMap.get(lang);
                    boolean hasTranslation = translation != null
                            && translation.getName() != null && !translation.getName().isBlank();
                    boolean hasAudio = audioMap.containsKey(lang);
                    boolean hasTts = translation != null && translation.getTtsScript() != null
                            && !translation.getTtsScript().isBlank();
                    return new CoverageCell(lang, hasTranslation, hasAudio, hasTts);
                })
                .toList();
        return new CoverageResponse(poi.getId(), poi.getCode(), poi.getName(),
                translationMap.size(), audioMap.size(), cells);
    }

    @Transactional(readOnly = true)
    public List<CoverageResponse> coverageAll() {
        return pois.findAll().stream().map(poi -> coverage(poi.getId())).toList();
    }

    // ------------------------------------------------------------------
    // Public app operations
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<Summary> publishedList(String languageCode, Long tourId, Double latitude, Double longitude,
                                       Double maxDistanceMeters, int limit) {
        String language = normalizeLanguage(languageCode);
        if ((latitude == null) != (longitude == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both latitude and longitude are required");
        }
        List<Poi> published = pois.findByStatusOrderByNameAsc(PoiStatus.PUBLISHED);

        if (tourId != null) {
            Tour tour = tours.findById(tourId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
            if (tour.getStatus() != TourStatus.PUBLISHED) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour is not published");
            }
            Set<Long> ids = tourPois.findByTourIdOrderByOrderIndexAsc(tourId).stream()
                    .map(tp -> tp.getPoi().getId())
                    .collect(Collectors.toSet());
            published = published.stream().filter(p -> ids.contains(p.getId())).toList();
        }
        if (published.isEmpty()) {
            return List.of();
        }

        Map<Long, List<PoiTranslation>> translationMap = translations
                .findByPoiIdIn(published.stream().map(Poi::getId).toList()).stream()
                .collect(Collectors.groupingBy(t -> t.getPoi().getId()));
        Map<Long, List<PoiImage>> imageMap = images
                .findByPoiIdIn(published.stream().map(Poi::getId).toList()).stream()
                .collect(Collectors.groupingBy(i -> i.getPoi().getId()));

        List<Summary> result = new ArrayList<>();
        for (Poi poi : published) {
            Double distance = null;
            if (latitude != null && longitude != null) {
                distance = GeoUtils.distanceMeters(latitude, longitude, poi.getLatitude(), poi.getLongitude());
                if (maxDistanceMeters != null && distance > maxDistanceMeters) {
                    continue;
                }
            }
            result.add(toSummary(poi, language, translationMap.getOrDefault(poi.getId(), List.of()),
                    imageMap.getOrDefault(poi.getId(), List.of()), distance));
        }
        if (latitude != null) {
            result.sort(Comparator.comparing(Summary::distanceMeters,
                    Comparator.nullsLast(Comparator.naturalOrder())));
        }
        int safeLimit = Math.min(Math.max(limit, 1), 500);
        return result.size() > safeLimit ? result.subList(0, safeLimit) : result;
    }

    @Transactional(readOnly = true)
    public Detail publishedDetail(Long id, String languageCode) {
        String language = normalizeLanguage(languageCode);
        Poi poi = find(id);
        if (poi.getStatus() != PoiStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "POI not found");
        }
        return buildDetail(poi, language);
    }

    @Transactional(readOnly = true)
    public List<SyncPoi> syncPois(long sinceVersion, String languageCode) {
        String language = normalizeLanguage(languageCode);
        List<Poi> changed = sinceVersion <= 0
                ? pois.findByStatusInOrderByNameAsc(List.of(PoiStatus.PUBLISHED))
                : pois.findByVersionGreaterThanAndStatusInOrderByIdAsc(
                        sinceVersion, List.of(PoiStatus.PUBLISHED, PoiStatus.ARCHIVED));
        if (changed.isEmpty()) {
            return List.of();
        }
        List<Long> poiIds = changed.stream().map(Poi::getId).toList();
        Map<Long, List<PoiTranslation>> translationMap = translations.findByPoiIdIn(poiIds).stream()
                .collect(Collectors.groupingBy(t -> t.getPoi().getId()));
        Map<Long, List<PoiAudio>> audioMap = audios.findByPoiIdIn(poiIds).stream()
                .collect(Collectors.groupingBy(a -> a.getPoi().getId()));
        Map<Long, List<PoiImage>> imageMap = images.findByPoiIdIn(poiIds).stream()
                .collect(Collectors.groupingBy(i -> i.getPoi().getId()));

        Map<Long, List<TourPoi>> tourMap = tourPois.findByPoiIdIn(poiIds).stream()
                .collect(Collectors.groupingBy(tp -> tp.getPoi().getId()));
        Set<Long> tourIds = tourMap.values().stream().flatMap(List::stream)
                .map(tp -> tp.getTour().getId()).collect(Collectors.toSet());
        Map<Long, Tour> publishedTours = tours.findAllById(tourIds).stream()
                .filter(t -> t.getStatus() == TourStatus.PUBLISHED)
                .collect(Collectors.toMap(Tour::getId, Function.identity()));

        List<SyncPoi> result = new ArrayList<>();
        for (Poi poi : changed) {
            List<PoiTranslation> poiTranslations = translationMap.getOrDefault(poi.getId(), List.of());
            PoiTranslation selected = selectTranslation(poiTranslations, language);
            boolean missing = selected == null || !selected.getLanguageCode().equals(language);
            String cover = coverUrl(imageMap.getOrDefault(poi.getId(), List.of()));
            List<Long> poiTourIds = tourMap.getOrDefault(poi.getId(), List.of()).stream()
                    .map(tp -> tp.getTour().getId())
                    .filter(publishedTours::containsKey)
                    .toList();
            result.add(new SyncPoi(
                    poi.getId(), poi.getCode(), poi.getName(),
                    selected == null ? poi.getName() : selected.getName(),
                    selected == null ? null : selected.getDescription(),
                    selected == null ? null : selected.getTtsScript(),
                    selected == null ? language : selected.getLanguageCode(), missing,
                    poi.getLatitude(), poi.getLongitude(), poi.getRadiusMeters(), poi.getPriority(),
                    poi.getCooldownMinutes(), poi.getStatus().name(),
                    poi.getWard() == null ? null : poi.getWard().getId(),
                    poi.getWard() == null ? null : poi.getWard().getName(),
                    poi.getBusStop() == null ? null : poi.getBusStop().getId(),
                    poi.getBusStop() == null ? null : poi.getBusStop().getName(),
                    cover, poi.getVersion(),
                    audioMap.getOrDefault(poi.getId(), List.of()).stream().map(this::toAudioResponse).toList(),
                    imageMap.getOrDefault(poi.getId(), List.of()).stream()
                            .sorted(Comparator.comparingInt(PoiImage::getSortOrder))
                            .map(this::toImageResponse).toList(),
                    poiTourIds
            ));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Poi> publishedForPackage(Long tourId, Long wardId) {
        List<Poi> published;
        if (tourId != null) {
            Tour tour = tours.findById(tourId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
            if (tour.getStatus() != TourStatus.PUBLISHED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tour must be published first");
            }
            Set<Long> ids = tourPois.findByTourIdOrderByOrderIndexAsc(tourId).stream()
                    .map(tp -> tp.getPoi().getId()).collect(Collectors.toSet());
            published = pois.findByStatusOrderByNameAsc(PoiStatus.PUBLISHED).stream()
                    .filter(p -> ids.contains(p.getId())).toList();
        } else {
            published = pois.findByStatusOrderByNameAsc(PoiStatus.PUBLISHED);
        }
        if (wardId != null) {
            published = published.stream()
                    .filter(p -> p.getWard() != null && p.getWard().getId().equals(wardId))
                    .toList();
        }
        return published;
    }

    @Transactional(readOnly = true)
    public Detail buildDetail(Poi poi, String languageCode) {
        String language = normalizeLanguage(languageCode);
        List<PoiTranslation> poiTranslations = translations.findByPoiId(poi.getId());
        List<PoiImage> poiImages = images.findByPoiIdOrderBySortOrderAsc(poi.getId());
        List<PoiAudio> poiAudios = audios.findByPoiIdOrderByLanguageCodeAsc(poi.getId());
        List<TourPoi> memberships = tourPois.findByPoiId(poi.getId());
        List<TourRef> tourRefs = memberships.stream()
                .filter(tp -> tp.getTour().getStatus() == TourStatus.PUBLISHED)
                .sorted(Comparator.comparingInt(TourPoi::getOrderIndex))
                .map(tp -> new TourRef(tp.getTour().getId(), tp.getTour().getCode(),
                        tp.getTour().getName(), tp.getOrderIndex()))
                .toList();
        PoiTranslation selected = selectTranslation(poiTranslations, language);
        boolean missing = selected == null || !selected.getLanguageCode().equals(language);
        String fallbackLabel = missing ? "Chưa có bản dịch" : null;
        Summary summary = toSummary(poi, language, poiTranslations, poiImages, null);
        return new Detail(summary,
                selected == null ? null : selected.getTtsScript(),
                fallbackLabel,
                poiAudios.stream().map(this::toAudioResponse).toList(),
                poiImages.stream().map(this::toImageResponse).toList(),
                tourRefs);
    }

    public PoiTranslation selectTranslation(List<PoiTranslation> available, String language) {
        Map<String, PoiTranslation> byLanguage = available.stream()
                .collect(Collectors.toMap(PoiTranslation::getLanguageCode, Function.identity(), (a, b) -> a));
        PoiTranslation selected = byLanguage.get(language);
        if (selected == null) selected = byLanguage.get("en");
        if (selected == null) selected = byLanguage.get("vi");
        return selected;
    }

    public Poi find(Long id) {
        return pois.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "POI not found"));
    }

    // ------------------------------------------------------------------
    // Mapping helpers
    // ------------------------------------------------------------------

    public AdminResponse toAdmin(Poi poi) {
        int translationCount = (int) translations.countByPoiId(poi.getId());
        int audioCount = audios.findByPoiIdOrderByLanguageCodeAsc(poi.getId()).size();
        int imageCount = images.findByPoiIdOrderBySortOrderAsc(poi.getId()).size();
        return toAdmin(poi, translationCount, audioCount, imageCount);
    }

    private AdminResponse toAdmin(Poi poi, int translationCount, int audioCount, int imageCount) {
        return new AdminResponse(poi.getId(), poi.getCode(), poi.getName(), poi.getStatus().name(),
                poi.getLatitude(), poi.getLongitude(), poi.getRadiusMeters(), poi.getPriority(),
                poi.getCooldownMinutes(),
                poi.getWard() == null ? null : poi.getWard().getId(),
                poi.getWard() == null ? null : poi.getWard().getName(),
                poi.getBusStop() == null ? null : poi.getBusStop().getId(),
                poi.getBusStop() == null ? null : poi.getBusStop().getName(),
                poi.getVersion(), poi.isPreviouslyPublished(),
                translationCount, audioCount, imageCount,
                poi.getCreatedAt(), poi.getUpdatedAt());
    }

    private Map<Long, Integer> groupedCounts(List<Long> ids,
                                             Function<List<Long>, List<Object[]>> query) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        Map<Long, Integer> counts = new HashMap<>();
        for (Object[] row : query.apply(ids)) {
            counts.put((Long) row[0], ((Long) row[1]).intValue());
        }
        return counts;
    }

    public Summary toSummary(Poi poi, String language, List<PoiTranslation> poiTranslations,
                             List<PoiImage> poiImages, Double distance) {
        PoiTranslation selected = selectTranslation(poiTranslations, language);
        boolean missing = selected == null || !selected.getLanguageCode().equals(language);
        String name = selected != null ? selected.getName() : poi.getName();
        String description = selected != null ? selected.getDescription() : null;
        return new Summary(poi.getId(), poi.getCode(), name, description,
                selected == null ? language : selected.getLanguageCode(), missing,
                poi.getLatitude(), poi.getLongitude(), poi.getRadiusMeters(), poi.getPriority(),
                poi.getCooldownMinutes(), poi.getStatus().name(),
                poi.getWard() == null ? null : poi.getWard().getId(),
                poi.getWard() == null ? null : poi.getWard().getName(),
                poi.getBusStop() == null ? null : poi.getBusStop().getId(),
                poi.getBusStop() == null ? null : poi.getBusStop().getName(),
                coverUrl(poiImages),
                distance == null ? null : Math.round(distance * 10.0) / 10.0,
                poi.getVersion(), poi.getUpdatedAt());
    }

    public AudioResponse toAudioResponse(PoiAudio audio) {
        return new AudioResponse(audio.getId(), audio.getLanguageCode(), audio.getFileName(),
                audio.getContentType(), audio.getFormat(), audio.getSizeBytes(),
                audio.getDurationSeconds(), audio.getChecksumSha256(),
                "/api/v1/media/audio/" + audio.getId());
    }

    public ImageResponse toImageResponse(PoiImage image) {
        return new ImageResponse(image.getId(), image.getFileName(), image.getContentType(),
                image.getSizeBytes(), image.getSortOrder(), image.isCoverImage(),
                "/api/v1/media/images/" + image.getId());
    }

    public TranslationResponse toTranslationResponse(PoiTranslation translation) {
        boolean complete = translation.getName() != null && !translation.getName().isBlank()
                && translation.getDescription() != null && !translation.getDescription().isBlank();
        return new TranslationResponse(translation.getId(), translation.getLanguageCode(),
                translation.getName(), translation.getDescription(), translation.getTtsScript(),
                complete, translation.getUpdatedAt());
    }

    public String coverUrl(List<PoiImage> poiImages) {
        if (poiImages == null || poiImages.isEmpty()) {
            return null;
        }
        PoiImage cover = poiImages.stream()
                .filter(PoiImage::isCoverImage)
                .findFirst()
                .orElseGet(() -> poiImages.stream()
                        .min(Comparator.comparingInt(PoiImage::getSortOrder))
                        .orElse(poiImages.get(0)));
        return "/api/v1/media/images/" + cover.getId();
    }

    // ------------------------------------------------------------------
    // Validation helpers
    // ------------------------------------------------------------------

    private List<PublishIssue> validateForPublish(Poi poi) {
        List<PublishIssue> issues = new ArrayList<>();
        PoiTranslation vi = translations.findByPoiIdAndLanguageCode(poi.getId(), "vi").orElse(null);
        if (vi == null || vi.getName() == null || vi.getName().isBlank()) {
            issues.add(issue(poi, "Missing Vietnamese name translation"));
        } else {
            if (vi.getDescription() == null || vi.getDescription().isBlank()) {
                issues.add(issue(poi, "Missing Vietnamese description"));
            }
            boolean hasAudio = audios.existsByPoiIdAndLanguageCode(poi.getId(), "vi");
            boolean hasScript = vi.getTtsScript() != null && !vi.getTtsScript().isBlank();
            if (!hasAudio && !hasScript) {
                issues.add(issue(poi, "Need Vietnamese audio or a Vietnamese TTS script"));
            }
        }
        if (poi.getRadiusMeters() < 20 || poi.getRadiusMeters() > 300) {
            issues.add(issue(poi, "Geofence radius must be between 20 and 300 meters"));
        }
        if (poi.getPriority() < 1 || poi.getPriority() > 5) {
            issues.add(issue(poi, "Priority must be between 1 and 5"));
        }
        if (!GeoUtils.isValidLatitude(poi.getLatitude()) || !GeoUtils.isValidLongitude(poi.getLongitude())) {
            issues.add(issue(poi, "Invalid coordinates"));
        }
        return issues;
    }

    private PublishIssue issue(Poi poi, String message) {
        return new PublishIssue(poi.getId(), poi.getCode(), message);
    }

    private void touchIfPublished(Poi poi) {
        if (poi.getStatus() == PoiStatus.PUBLISHED) {
            poi.setVersion(versions.next());
        }
    }

    private String uniqueCode(String requested, String name) {
        String base = requested != null && !requested.isBlank()
                ? requested.trim()
                : CodeUtils.slugify(name);
        if (!pois.existsByCode(base)) {
            return base;
        }
        for (int i = 0; i < 5; i++) {
            String candidate = base + "-" + CodeUtils.randomBase62(8).toLowerCase(Locale.ROOT);
            if (!pois.existsByCode(candidate)) {
                return candidate;
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot generate a unique POI code");
    }

    private void applyGeography(Poi poi, Long wardId, Long busStopId) {
        if (wardId != null) {
            Ward ward = wards.findById(wardId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ward not found"));
            poi.setWard(ward);
        } else {
            poi.setWard(null);
        }
        if (busStopId != null) {
            BusStop stop = busStops.findById(busStopId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus stop not found"));
            poi.setBusStop(stop);
        } else {
            poi.setBusStop(null);
        }
    }

    public String normalizeLanguage(String languageCode) {
        if (languageCode == null || languageCode.isBlank()) {
            return "vi";
        }
        String normalized = LanguageCatalog.normalize(languageCode);
        if (!LanguageCatalog.supports(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported language. Supported: " + String.join(", ", LanguageCatalog.codes()));
        }
        return normalized;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
