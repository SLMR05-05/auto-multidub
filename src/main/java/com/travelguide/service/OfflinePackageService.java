package com.travelguide.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelguide.dto.PackageDtos.CreateRequest;
import com.travelguide.dto.PackageDtos.Response;
import com.travelguide.entity.*;
import com.travelguide.repository.OfflinePackageRepository;
import com.travelguide.repository.PoiAudioRepository;
import com.travelguide.repository.PoiImageRepository;
import com.travelguide.repository.PoiTranslationRepository;
import com.travelguide.util.CodeUtils;
import com.travelguide.util.HashUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class OfflinePackageService {

    private final OfflinePackageRepository packages;
    private final PoiService poiService;
    private final PoiTranslationRepository translations;
    private final PoiAudioRepository audios;
    private final PoiImageRepository images;
    private final StorageService storage;
    private final DataVersionService versions;
    private final ObjectMapper objectMapper;
    private final AuditService audit;

    public OfflinePackageService(OfflinePackageRepository packages, PoiService poiService,
                                 PoiTranslationRepository translations, PoiAudioRepository audios,
                                 PoiImageRepository images, StorageService storage,
                                 DataVersionService versions, ObjectMapper objectMapper,
                                 AuditService audit) {
        this.packages = packages;
        this.poiService = poiService;
        this.translations = translations;
        this.audios = audios;
        this.images = images;
        this.storage = storage;
        this.versions = versions;
        this.objectMapper = objectMapper;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<Response> list() {
        return packages.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public Response create(CreateRequest request) {
        String language = poiService.normalizeLanguage(request.languageCode());
        List<Poi> published = poiService.publishedForPackage(request.tourId(), request.wardId());
        if (published.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No published POIs match this package scope");
        }

        OfflinePackage pkg = new OfflinePackage();
        pkg.setCode(uniqueCode());
        pkg.setName(request.name().trim());
        pkg.setTourId(request.tourId());
        pkg.setWardId(request.wardId());
        pkg.setLanguageCode(language);
        pkg.setDataVersion(versions.current());
        pkg.setPoiCount(published.size());
        pkg.setStatus(PackageStatus.BUILDING);
        pkg = packages.save(pkg);

        try {
            Path zip = buildZip(pkg, published, language);
            pkg.setFilePath(zip.toString());
            pkg.setSizeBytes(Files.size(zip));
            pkg.setChecksumSha256(HashUtils.sha256(zip));
            pkg.setStatus(PackageStatus.READY);
            pkg.setBuiltAt(LocalDateTime.now());
            pkg = packages.save(pkg);
            audit.record("BUILD_OFFLINE_PACKAGE", "OFFLINE_PACKAGE", pkg.getId(), null,
                    toResponse(pkg));
            return toResponse(pkg);
        } catch (Exception ex) {
            storage.deleteQuietly(storage.packageDirectory().resolve(pkg.getCode() + ".zip").toString());
            pkg.setStatus(PackageStatus.FAILED);
            pkg.setErrorMessage(truncate(ex.getMessage(), 500));
            pkg = packages.save(pkg);
            audit.record("BUILD_OFFLINE_PACKAGE_FAILED", "OFFLINE_PACKAGE", pkg.getId(), null,
                    Map.of("error", String.valueOf(ex.getMessage())));
            return toResponse(pkg);
        }
    }

    @Transactional
    public void delete(Long id) {
        OfflinePackage pkg = find(id);
        storage.deleteQuietly(pkg.getFilePath());
        audit.record("DELETE_OFFLINE_PACKAGE", "OFFLINE_PACKAGE", id, toResponse(pkg), null);
        packages.delete(pkg);
    }

    @Transactional(readOnly = true)
    public OfflinePackage find(Long id) {
        return packages.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offline package not found"));
    }

    public Response toResponse(OfflinePackage pkg) {
        return new Response(pkg.getId(), pkg.getCode(), pkg.getName(), pkg.getTourId(), pkg.getWardId(),
                pkg.getLanguageCode(), pkg.getDataVersion(), pkg.getStatus().name(),
                pkg.getSizeBytes(), pkg.getChecksumSha256(), pkg.getPoiCount(), pkg.getErrorMessage(),
                pkg.getStatus() == PackageStatus.READY
                        ? "/api/v1/app/offline-packages/" + pkg.getId() + "/download" : null,
                pkg.getCreatedAt(), pkg.getBuiltAt());
    }

    private Path buildZip(OfflinePackage pkg, List<Poi> published, String language) throws IOException {
        List<Long> poiIds = published.stream().map(Poi::getId).toList();
        Map<Long, List<PoiTranslation>> translationMap = translations.findByPoiIdIn(poiIds).stream()
                .collect(java.util.stream.Collectors.groupingBy(t -> t.getPoi().getId()));
        Map<Long, List<PoiAudio>> audioMap = audios.findByPoiIdIn(poiIds).stream()
                .collect(java.util.stream.Collectors.groupingBy(a -> a.getPoi().getId()));
        Map<Long, List<PoiImage>> imageMap = images.findByPoiIdIn(poiIds).stream()
                .collect(java.util.stream.Collectors.groupingBy(i -> i.getPoi().getId()));

        Path zipPath = storage.packageDirectory().resolve(pkg.getCode() + ".zip").normalize();
        Files.createDirectories(storage.packageDirectory());
        try (OutputStream fileOut = Files.newOutputStream(zipPath);
             ZipOutputStream zip = new ZipOutputStream(fileOut, StandardCharsets.UTF_8)) {

            List<Map<String, Object>> poiEntries = new ArrayList<>();
            for (Poi poi : published) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("id", poi.getId());
                entry.put("code", poi.getCode());
                entry.put("name", poi.getName());
                entry.put("latitude", poi.getLatitude());
                entry.put("longitude", poi.getLongitude());
                entry.put("radiusMeters", poi.getRadiusMeters());
                entry.put("priority", poi.getPriority());
                entry.put("cooldownMinutes", poi.getCooldownMinutes());
                entry.put("status", poi.getStatus().name());
                entry.put("version", poi.getVersion());
                entry.put("wardId", poi.getWard() == null ? null : poi.getWard().getId());
                entry.put("wardName", poi.getWard() == null ? null : poi.getWard().getName());
                entry.put("busStopId", poi.getBusStop() == null ? null : poi.getBusStop().getId());
                entry.put("busStopName", poi.getBusStop() == null ? null : poi.getBusStop().getName());

                PoiTranslation selected = poiService.selectTranslation(
                        translationMap.getOrDefault(poi.getId(), List.of()), language);
                String contentLanguage = selected == null ? language : selected.getLanguageCode();
                entry.put("languageCode", contentLanguage);
                entry.put("missingTranslation", selected == null || !contentLanguage.equals(language));
                entry.put("nameLocalized", selected == null ? poi.getName() : selected.getName());
                entry.put("description", selected == null ? null : selected.getDescription());
                entry.put("ttsScript", selected == null ? null : selected.getTtsScript());

                PoiAudio audio = audioMap.getOrDefault(poi.getId(), List.of()).stream()
                        .filter(item -> item.getLanguageCode().equals(language))
                        .findFirst().orElse(null);
                entry.put("audio", null);
                if (audio != null) {
                    Path audioPath = storage.resolve(audio.getFilePath());
                    if (Files.exists(audioPath)) {
                        String extension = audio.getFormat() == null ? "mp3" : audio.getFormat();
                        String entryName = "audio/" + poi.getId() + "/audio." + extension;
                        String checksum = writeEntry(zip, entryName, audioPath);
                        entry.put("audio", Map.of(
                                "path", entryName,
                                "languageCode", audio.getLanguageCode(),
                                "format", extension,
                                "durationSeconds", audio.getDurationSeconds(),
                                "checksumSha256", checksum,
                                "sizeBytes", Files.size(audioPath)
                        ));
                    }
                }

                List<Map<String, Object>> imageEntries = new ArrayList<>();
                for (PoiImage image : imageMap.getOrDefault(poi.getId(), List.of())) {
                    Path imagePath = storage.resolve(image.getFilePath());
                    if (!Files.exists(imagePath)) {
                        continue;
                    }
                    String extension = extensionOf(image.getContentType(), image.getFileName());
                    String entryName = "images/" + image.getId() + "." + extension;
                    String checksum = writeEntry(zip, entryName, imagePath);
                    Map<String, Object> imageEntry = new LinkedHashMap<>();
                    imageEntry.put("id", image.getId());
                    imageEntry.put("path", entryName);
                    imageEntry.put("cover", image.isCoverImage());
                    imageEntry.put("sortOrder", image.getSortOrder());
                    imageEntry.put("checksumSha256", checksum);
                    imageEntry.put("sizeBytes", Files.size(imagePath));
                    imageEntries.add(imageEntry);
                }
                entry.put("images", imageEntries);
                poiEntries.add(entry);
            }

            Map<String, Object> manifest = new LinkedHashMap<>();
            manifest.put("code", pkg.getCode());
            manifest.put("name", pkg.getName());
            manifest.put("languageCode", language);
            manifest.put("dataVersion", pkg.getDataVersion());
            manifest.put("generatedAt", LocalDateTime.now().toString());
            manifest.put("poiCount", poiEntries.size());
            manifest.put("pois", poiEntries);

            byte[] manifestBytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(manifest);
            zip.putNextEntry(new ZipEntry("manifest.json"));
            zip.write(manifestBytes);
            zip.closeEntry();
        }
        return zipPath;
    }

    private String writeEntry(ZipOutputStream zip, String name, Path file) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        Files.copy(file, zip);
        zip.closeEntry();
        return HashUtils.sha256(file);
    }

    private String extensionOf(String contentType, String fileName) {
        if (contentType != null) {
            if (contentType.contains("png")) return "png";
            if (contentType.contains("webp")) return "webp";
            if (contentType.contains("jpeg") || contentType.contains("jpg")) return "jpg";
        }
        String extension = StorageService.extensionOf(fileName, "jpg");
        return "jpeg".equals(extension) ? "jpg" : extension;
    }

    private String uniqueCode() {
        for (int i = 0; i < 10; i++) {
            String code = "pkg-" + CodeUtils.randomBase62(10);
            if (!packages.existsByCode(code)) {
                return code;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot generate package code");
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
