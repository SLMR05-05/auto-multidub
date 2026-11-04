package com.travelguide.service;

import com.travelguide.dto.CommonDtos.PageResponse;
import com.travelguide.dto.TourDtos.*;
import com.travelguide.entity.Poi;
import com.travelguide.entity.PoiStatus;
import com.travelguide.entity.Tour;
import com.travelguide.entity.TourPoi;
import com.travelguide.entity.TourStatus;
import com.travelguide.repository.PoiImageRepository;
import com.travelguide.repository.PoiRepository;
import com.travelguide.repository.TourPoiRepository;
import com.travelguide.repository.TourRepository;
import com.travelguide.util.CodeUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TourService {

    private final TourRepository tours;
    private final TourPoiRepository tourPois;
    private final PoiRepository pois;
    private final PoiImageRepository images;
    private final PoiService poiService;
    private final DataVersionService versions;
    private final AuditService audit;

    public TourService(TourRepository tours, TourPoiRepository tourPois, PoiRepository pois,
                       PoiImageRepository images, PoiService poiService,
                       DataVersionService versions, AuditService audit) {
        this.tours = tours;
        this.tourPois = tourPois;
        this.pois = pois;
        this.images = images;
        this.poiService = poiService;
        this.versions = versions;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public PageResponse<TourResponse> adminSearch(String search, TourStatus status, int page, int size) {
        Page<Tour> result = tours.search(blankToNull(search), status,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                        Sort.by(Sort.Direction.DESC, "updatedAt")));
        Map<Long, List<TourPoi>> linksByTour = linksByTour(result.getContent());
        Map<Long, List<com.travelguide.entity.PoiImage>> imagesByPoi = imagesByPoi(linksByTour);
        return PageResponse.of(result.map(tour -> toResponse(tour, true,
                linksByTour.getOrDefault(tour.getId(), List.of()), imagesByPoi)));
    }
    @Transactional(readOnly = true)
    public TourResponse adminGet(Long id) {
        return toResponse(find(id), true);
    }

    @Transactional
    public TourResponse create(TourRequest request) {
        Tour tour = new Tour();
        tour.setCode(uniqueCode(request.code(), request.name()));
        tour.setName(request.name().trim());
        tour.setDescription(request.description());
        tour.setStatus(TourStatus.DRAFT);
        tour = tours.save(tour);
        audit.record("CREATE", "TOUR", tour.getId(), null, toResponse(tour, true));
        return toResponse(tour, true);
    }

    @Transactional
    public TourResponse update(Long id, TourRequest request) {
        Tour tour = find(id);
        TourResponse before = toResponse(tour, true);
        if (request.code() != null && !request.code().isBlank()
                && !request.code().trim().equals(tour.getCode())) {
            if (tours.existsByCode(request.code().trim())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Tour code already exists");
            }
            tour.setCode(request.code().trim());
        }
        tour.setName(request.name().trim());
        tour.setDescription(request.description());
        touchIfPublished(tour);
        tour = tours.save(tour);
        audit.record("UPDATE", "TOUR", id, before, toResponse(tour, true));
        return toResponse(tour, true);
    }

    @Transactional
    public TourResponse setPois(Long tourId, List<Long> poiIds) {
        Tour tour = find(tourId);
        if (poiIds == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "poiIds is required");
        }
        List<Long> unique = new ArrayList<>(new LinkedHashSet<>(poiIds));
        if (unique.size() != poiIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate POI ids are not allowed");
        }
        Map<Long, Poi> found = pois.findAllById(unique).stream()
                .collect(Collectors.toMap(Poi::getId, Function.identity()));
        if (found.size() != unique.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more POIs do not exist");
        }
        tourPois.deleteByTourId(tourId);
        tourPois.flush();
        int index = 0;
        for (Long poiId : unique) {
            TourPoi link = new TourPoi();
            link.setTour(tour);
            link.setPoi(found.get(poiId));
            link.setOrderIndex(index++);
            tourPois.save(link);
        }
        touchIfPublished(tour);
        tours.save(tour);
        audit.record("SET_TOUR_POIS", "TOUR", tourId, null, Map.of("poiIds", unique));
        return toResponse(tour, true);
    }

    @Transactional
    public TourResponse publish(Long id) {
        Tour tour = find(id);
        List<TourPoi> links = tourPois.findByTourIdOrderByOrderIndexAsc(id);
        if (links.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "A tour needs at least one POI");
        }
        List<String> unpublished = links.stream()
                .map(TourPoi::getPoi)
                .filter(poi -> poi.getStatus() != PoiStatus.PUBLISHED)
                .map(Poi::getCode)
                .toList();
        if (!unpublished.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Publish all POIs first: " + String.join(", ", unpublished));
        }
        tour.setStatus(TourStatus.PUBLISHED);
        tour.setVersion(versions.next());
        tour = tours.save(tour);
        audit.record("PUBLISH", "TOUR", id, null, Map.of("version", tour.getVersion()));
        return toResponse(tour, true);
    }

    @Transactional
    public void archive(Long id) {
        Tour tour = find(id);
        if (tour.getStatus() == TourStatus.ARCHIVED) {
            return;
        }
        TourResponse before = toResponse(tour, true);
        if (tour.getStatus() == TourStatus.PUBLISHED) {
            tour.setVersion(versions.next());
        }
        tour.setStatus(TourStatus.ARCHIVED);
        tours.save(tour);
        audit.record("ARCHIVE", "TOUR", id, before, toResponse(tour, true));
    }

    @Transactional(readOnly = true)
    public List<TourResponse> publicList() {
        List<Tour> published = tours.findByStatusOrderByNameAsc(TourStatus.PUBLISHED);
        Map<Long, List<TourPoi>> linksByTour = linksByTour(published);
        Map<Long, List<com.travelguide.entity.PoiImage>> imagesByPoi = imagesByPoi(linksByTour);
        return published.stream()
                .map(tour -> toResponse(tour, false,
                        linksByTour.getOrDefault(tour.getId(), List.of()), imagesByPoi))
                .toList();
    }

    @Transactional(readOnly = true)
    public TourResponse publicGet(Long id) {
        Tour tour = find(id);
        if (tour.getStatus() != TourStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found");
        }
        return toResponse(tour, false);
    }

    @Transactional(readOnly = true)
    public List<TourResponse> syncTours(long sinceVersion) {
        List<Tour> changed = sinceVersion <= 0
                ? tours.findByStatusOrderByNameAsc(TourStatus.PUBLISHED)
                : tours.findByVersionGreaterThanAndStatusInOrderByIdAsc(
                        sinceVersion, List.of(TourStatus.PUBLISHED, TourStatus.ARCHIVED));
        Map<Long, List<TourPoi>> linksByTour = linksByTour(changed);
        Map<Long, List<com.travelguide.entity.PoiImage>> imagesByPoi = imagesByPoi(linksByTour);
        return changed.stream()
                .map(tour -> toResponse(tour, tour.getStatus() == TourStatus.ARCHIVED,
                        linksByTour.getOrDefault(tour.getId(), List.of()), imagesByPoi))
                .toList();
    }

    public Tour find(Long id) {
        return tours.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
    }

    public TourResponse toResponse(Tour tour, boolean includeUnpublishedPois) {
        List<TourPoi> links = tourPois.findByTourIdOrderByOrderIndexAsc(tour.getId());
        return toResponse(tour, includeUnpublishedPois, links, imagesByPoi(links));
    }

    private TourResponse toResponse(Tour tour, boolean includeUnpublishedPois,
                                    List<TourPoi> links,
                                    Map<Long, List<com.travelguide.entity.PoiImage>> imageMap) {
        List<TourPoiItem> items = links.stream()
                .filter(link -> includeUnpublishedPois
                        || link.getPoi().getStatus() == PoiStatus.PUBLISHED)
                .map(link -> {
                    Poi poi = link.getPoi();
                    List<com.travelguide.entity.PoiImage> poiImages =
                            imageMap.getOrDefault(poi.getId(), List.of());
                    return new TourPoiItem(poi.getId(), poi.getCode(), poi.getName(),
                            link.getOrderIndex(), poi.getLatitude(), poi.getLongitude(),
                            poiService.coverUrl(poiImages));
                })
                .toList();

        return new TourResponse(tour.getId(), tour.getCode(), tour.getName(), tour.getDescription(),
                tour.getStatus().name(), tour.getVersion(), items,
                tour.getCreatedAt(), tour.getUpdatedAt());
    }

    private Map<Long, List<TourPoi>> linksByTour(List<Tour> tourList) {
        if (tourList.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = tourList.stream().map(Tour::getId).toList();
        return tourPois.findByTourIdInOrderByTourIdAscOrderIndexAsc(ids).stream()
                .collect(Collectors.groupingBy(link -> link.getTour().getId(),
                        LinkedHashMap::new, Collectors.toList()));
    }

    private Map<Long, List<com.travelguide.entity.PoiImage>> imagesByPoi(
            Map<Long, List<TourPoi>> linksByTour) {
        Set<Long> poiIds = linksByTour.values().stream()
                .flatMap(List::stream)
                .map(link -> link.getPoi().getId())
                .collect(Collectors.toSet());
        if (poiIds.isEmpty()) {
            return Map.of();
        }
        return images.findByPoiIdIn(poiIds).stream()
                .collect(Collectors.groupingBy(image -> image.getPoi().getId()));
    }

    private Map<Long, List<com.travelguide.entity.PoiImage>> imagesByPoi(List<TourPoi> links) {
        Set<Long> poiIds = links.stream().map(link -> link.getPoi().getId()).collect(Collectors.toSet());
        if (poiIds.isEmpty()) {
            return Map.of();
        }
        return images.findByPoiIdIn(poiIds).stream()
                .collect(Collectors.groupingBy(image -> image.getPoi().getId()));
    }

    private void touchIfPublished(Tour tour) {
        if (tour.getStatus() == TourStatus.PUBLISHED) {
            tour.setVersion(versions.next());
        }
    }

    private String uniqueCode(String requested, String name) {
        String base = requested != null && !requested.isBlank()
                ? requested.trim()
                : CodeUtils.slugify(name);
        if (!tours.existsByCode(base)) {
            return base;
        }
        for (int i = 0; i < 5; i++) {
            String candidate = base + "-" + CodeUtils.randomBase62(8).toLowerCase(Locale.ROOT);
            if (!tours.existsByCode(candidate)) {
                return candidate;
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot generate a unique tour code");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
