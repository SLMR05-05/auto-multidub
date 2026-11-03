package com.travelguide.controller;

import com.travelguide.dto.ApiDtos.*;
import com.travelguide.entity.Audio;
import com.travelguide.service.AudioService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/audio")
public class AudioController {

    private final AudioService service;

    public AudioController(AudioService service) {
        this.service = service;
    }

    @PostMapping("/synthesize")
    public AudioResponse synthesize(
            @Valid @RequestBody SpeechRequest request
    ) {
        return service.synthesize(
                request.translationId(),
                request.voiceName()
        );
    }

    @GetMapping("/{id}/stream")
    public ResponseEntity<Resource> stream(@PathVariable Long id) {

        Audio audio = service.getAudio(id);

        Resource resource = new FileSystemResource(
                Path.of(audio.getFilePath())
        );

        if (!resource.exists()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Audio file missing"
            );
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/wav"))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + audio.getFileName() + "\""
                )
                .body(resource);
    }
}