package com.travelguide.controller;

import com.travelguide.entity.PoiAudio;
import com.travelguide.entity.PoiImage;
import com.travelguide.service.MediaService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaService media;

    public MediaController(MediaService media) {
        this.media = media;
    }

    @GetMapping("/audio/{id}")
    public ResponseEntity<Resource> audio(@PathVariable Long id) {
        PoiAudio audio = media.audioEntity(id);
        Path path = resolvePath(audio.getFilePath(), "audio");
        if (!Files.exists(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File missing");
        }
        String contentType = audio.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "audio/mpeg";
        }
        return fileResponse(path, contentType, audio.getFileName());
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<Resource> image(@PathVariable Long id) {
        PoiImage image = media.imageEntity(id);
        Path path = resolvePath(image.getFilePath(), "images");
        if (!Files.exists(path)) {
            if (image.getImageUrl() != null && image.getImageUrl().startsWith("http")) {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(java.net.URI.create(image.getImageUrl()))
                        .build();
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File missing");
        }
        String contentType = image.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "image/jpeg";
        }
        return fileResponse(path, contentType, image.getFileName());
    }

    private Path resolvePath(String filePath, String subfolder) {
        if (filePath == null || filePath.isBlank()) {
            return Path.of("missing");
        }
        Path path = Path.of(filePath).toAbsolutePath().normalize();
        if (Files.exists(path)) return path;

        Path relProject = Path.of(filePath).normalize();
        if (Files.exists(relProject)) return relProject.toAbsolutePath();

        Path inStorage = Path.of("storage", subfolder, Path.of(filePath).getFileName().toString()).toAbsolutePath().normalize();
        if (Files.exists(inStorage)) return inStorage;

        Path inSub = Path.of(subfolder, Path.of(filePath).getFileName().toString()).toAbsolutePath().normalize();
        if (Files.exists(inSub)) return inSub;

        return path;
    }

    private ResponseEntity<Resource> fileResponse(Path path, String contentType, String fileName) {
        Resource resource = new FileSystemResource(path);
        String disposition = ContentDisposition.inline()
                .filename(fileName == null || fileName.isBlank() ? path.getFileName().toString() : fileName,
                        StandardCharsets.UTF_8)
                .build()
                .toString();
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(contentType);
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(1)).cachePublic())
                .body(resource);
    }
}
