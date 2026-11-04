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
        return fileResponse(audio.getFilePath(), audio.getContentType(), audio.getFileName());
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<Resource> image(@PathVariable Long id) {
        PoiImage image = media.imageEntity(id);
        return fileResponse(image.getFilePath(), image.getContentType(), image.getFileName());
    }

    private ResponseEntity<Resource> fileResponse(String filePath, String contentType, String fileName) {
        Path path = Path.of(filePath).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File missing");
        }
        Resource resource = new FileSystemResource(path);
        String disposition = ContentDisposition.inline()
                .filename(fileName == null || fileName.isBlank() ? path.getFileName().toString() : fileName,
                        StandardCharsets.UTF_8)
                .build()
                .toString();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(1)).cachePublic())
                .body(resource);
    }
}
