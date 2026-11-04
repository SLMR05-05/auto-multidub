package com.travelguide.service;

import com.travelguide.dto.PoiDtos;
import com.travelguide.entity.Poi;
import com.travelguide.entity.PoiAudio;
import com.travelguide.entity.PoiImage;
import com.travelguide.entity.PoiStatus;
import com.travelguide.repository.PoiAudioRepository;
import com.travelguide.repository.PoiImageRepository;
import com.travelguide.repository.PoiRepository;
import com.travelguide.util.HashUtils;
import net.coobird.thumbnailator.Thumbnails;
import org.jaudiotagger.audio.AudioFile;
import org.jaudiotagger.audio.AudioFileIO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class MediaService {

    private static final long MAX_AUDIO_BYTES = 20L * 1024 * 1024;
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> AUDIO_EXTENSIONS = Set.of("mp3", "m4a", "aac", "wav");
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final PoiRepository pois;
    private final PoiAudioRepository audios;
    private final PoiImageRepository images;
    private final PoiService poiService;
    private final StorageService storage;
    private final DataVersionService versions;
    private final AuditService audit;

    public MediaService(PoiRepository pois, PoiAudioRepository audios, PoiImageRepository images,
                        PoiService poiService, StorageService storage,
                        DataVersionService versions, AuditService audit) {
        this.pois = pois;
        this.audios = audios;
        this.images = images;
        this.poiService = poiService;
        this.storage = storage;
        this.versions = versions;
        this.audit = audit;
    }

    @Transactional
    public PoiDtos.AudioResponse uploadAudio(Long poiId, String languageCode, MultipartFile file) {
        Poi poi = poiService.find(poiId);
        String language = poiService.normalizeLanguage(languageCode);
        validateFile(file, MAX_AUDIO_BYTES, AUDIO_EXTENSIONS, "audio");
        String extension = StorageService.extensionOf(file.getOriginalFilename(), "mp3");
        Path stored = storage.store(file, storage.audioDirectory(), extension);

        double duration = extractDuration(stored);
        String checksum;
        try {
            checksum = HashUtils.sha256(stored);
        } catch (IOException ex) {
            storage.deleteQuietly(stored.toString());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot hash audio file");
        }

        PoiAudio audio = audios.findByPoiIdAndLanguageCode(poiId, language).orElseGet(() -> {
            PoiAudio created = new PoiAudio();
            created.setPoi(poi);
            created.setLanguageCode(language);
            return created;
        });
        String previousPath = audio.getFilePath();
        audio.setFileName(safeFileName(file, stored));
        audio.setFilePath(stored.toString());
        audio.setContentType(contentType(extension, true));
        audio.setFormat(extension);
        audio.setSizeBytes(file.getSize());
        audio.setDurationSeconds(duration);
        audio.setChecksumSha256(checksum);
        audio = audios.save(audio);
        if (previousPath != null && !previousPath.equals(stored.toString())) {
            storage.deleteQuietly(previousPath);
        }

        touchPublished(poi);
        audit.record("UPLOAD_AUDIO", "POI", poiId,
                null, Map.of("language", language, "fileName", audio.getFileName()));
        return poiService.toAudioResponse(audio);
    }

    @Transactional
    public PoiDtos.ImageResponse uploadImage(Long poiId, MultipartFile file) {
        Poi poi = poiService.find(poiId);
        validateFile(file, MAX_IMAGE_BYTES, IMAGE_EXTENSIONS, "image");
        String extension = StorageService.extensionOf(file.getOriginalFilename(), "jpg");
        String normalizedExtension = "jpeg".equals(extension) ? "jpg" : extension;

        Path stored;
        if ("webp".equals(normalizedExtension)) {
            // ImageIO/Thumbnailator does not handle WebP without extra native plugins.
            stored = storage.store(file, storage.imageDirectory(), normalizedExtension);
        } else {
            stored = compressImage(file, normalizedExtension);
        }

        int sortOrder = images.findMaxSortOrder(poiId) + 1;
        boolean cover = sortOrder == 0;

        PoiImage image = new PoiImage();
        image.setPoi(poi);
        image.setFileName(safeFileName(file, stored));
        image.setFilePath(stored.toString());
        image.setContentType(contentType(normalizedExtension, false));
        image.setSizeBytes(fileSize(stored, file.getSize()));
        image.setSortOrder(sortOrder);
        image.setCoverImage(cover);
        image = images.save(image);

        touchPublished(poi);
        audit.record("UPLOAD_IMAGE", "POI", poiId,
                null, Map.of("fileName", image.getFileName(), "cover", cover));
        return poiService.toImageResponse(image);
    }

    @Transactional
    public List<PoiDtos.ImageResponse> reorderImages(Long poiId, List<Long> imageIds) {
        Poi poi = poiService.find(poiId);
        List<PoiImage> current = images.findByPoiIdOrderBySortOrderAsc(poiId);
        Map<Long, PoiImage> byId = current.stream()
                .collect(java.util.stream.Collectors.toMap(PoiImage::getId, image -> image));
        if (imageIds.size() != current.size()
                || new java.util.HashSet<>(imageIds).size() != imageIds.size()
                || !byId.keySet().containsAll(imageIds)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "imageIds must contain every image of this POI exactly once");
        }
        int index = 0;
        for (Long imageId : imageIds) {
            byId.get(imageId).setSortOrder(index++);
        }
        images.saveAll(current);
        touchPublished(poi);
        audit.record("REORDER_IMAGES", "POI", poiId, null, Map.of("imageIds", imageIds));
        return images.findByPoiIdOrderBySortOrderAsc(poiId).stream()
                .map(poiService::toImageResponse).toList();
    }

    @Transactional
    public PoiDtos.ImageResponse setCover(Long poiId, Long imageId) {
        Poi poi = poiService.find(poiId);
        List<PoiImage> current = images.findByPoiIdOrderBySortOrderAsc(poiId);
        PoiImage target = current.stream().filter(image -> image.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
        for (PoiImage image : current) {
            image.setCoverImage(image.getId().equals(imageId));
        }
        images.saveAll(current);
        touchPublished(poi);
        audit.record("SET_COVER_IMAGE", "POI", poiId, null, Map.of("imageId", imageId));
        return poiService.toImageResponse(target);
    }

    @Transactional
    public void deleteImage(Long poiId, Long imageId) {
        Poi poi = poiService.find(poiId);
        PoiImage image = images.findById(imageId)
                .filter(item -> item.getPoi().getId().equals(poiId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
        boolean wasCover = image.isCoverImage();
        images.delete(image);
        storage.deleteQuietly(image.getFilePath());
        if (wasCover) {
            List<PoiImage> rest = images.findByPoiIdOrderBySortOrderAsc(poiId);
            if (!rest.isEmpty()) {
                rest.get(0).setCoverImage(true);
                images.save(rest.get(0));
            }
        }
        touchPublished(poi);
        audit.record("DELETE_IMAGE", "POI", poiId, Map.of("imageId", imageId), null);
    }

    @Transactional
    public void deleteAudio(Long poiId, String languageCode) {
        Poi poi = poiService.find(poiId);
        String language = poiService.normalizeLanguage(languageCode);
        PoiAudio audio = audios.findByPoiIdAndLanguageCode(poiId, language)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Audio not found"));
        audios.delete(audio);
        storage.deleteQuietly(audio.getFilePath());
        touchPublished(poi);
        audit.record("DELETE_AUDIO", "POI", poiId, Map.of("language", language), null);
    }

    @Transactional(readOnly = true)
    public PoiAudio audioEntity(Long id) {
        return audios.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Audio not found"));
    }

    @Transactional(readOnly = true)
    public PoiImage imageEntity(Long id) {
        return images.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
    }

    private void touchPublished(Poi poi) {
        if (poi.getStatus() == PoiStatus.PUBLISHED) {
            poi.setVersion(versions.next());
            pois.save(poi);
        }
    }

    private void validateFile(MultipartFile file, long maxBytes, Set<String> extensions, String kind) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty " + kind + " file");
        }
        if (file.getSize() > maxBytes) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                    kind + " file exceeds " + (maxBytes / (1024 * 1024)) + " MB");
        }
        String extension = StorageService.extensionOf(file.getOriginalFilename(), "");
        if (!extensions.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported " + kind + " extension. Allowed: " + String.join(", ", extensions));
        }
    }

    private Path compressImage(MultipartFile file, String extension) {
        Path target = storage.imageDirectory().resolve(java.util.UUID.randomUUID() + "." + extension).normalize();
        try {
            Files.createDirectories(storage.imageDirectory());
            try (InputStream in = file.getInputStream()) {
                Thumbnails.of(in)
                        .size(1600, 1600)
                        .outputQuality(0.82)
                        .outputFormat("jpg".equals(extension) ? "jpg" : "png")
                        .toFile(target.toFile());
            }
            return target;
        } catch (Exception ex) {
            try {
                Files.deleteIfExists(target);
            } catch (IOException ignored) {
            }
            // Fall back to the original bytes rather than rejecting a valid upload.
            return storage.store(file, storage.imageDirectory(), extension);
        }
    }

    private double extractDuration(Path file) {
        try {
            AudioFile audioFile = AudioFileIO.read(file.toFile());
            return audioFile.getAudioHeader().getTrackLength();
        } catch (Exception ex) {
            return 0;
        }
    }

    private String safeFileName(MultipartFile file, Path stored) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            name = stored.getFileName().toString();
        }
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        name = name.replaceAll("[\\r\\n\\\"]", "_").trim();
        if (name.isBlank()) {
            name = stored.getFileName().toString();
        }
        return name.length() <= 255 ? name : name.substring(name.length() - 255);
    }

    private long fileSize(Path path, long fallback) {
        try {
            return Files.size(path);
        } catch (IOException ex) {
            return fallback;
        }
    }

    private String contentType(String extension, boolean audio) {
        return switch (extension.toLowerCase(Locale.ROOT)) {
            case "mp3" -> "audio/mpeg";
            case "m4a" -> "audio/mp4";
            case "aac" -> "audio/aac";
            case "wav" -> "audio/wav";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> audio ? "audio/mpeg" : "image/jpeg";
        };
    }
}
