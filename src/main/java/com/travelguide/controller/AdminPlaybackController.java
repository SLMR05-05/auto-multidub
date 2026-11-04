package com.travelguide.controller;

import com.travelguide.dto.CommonDtos.PageResponse;
import com.travelguide.dto.IngestDtos.PlaybackLogResponse;
import com.travelguide.entity.TriggerType;
import com.travelguide.service.PlaybackService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/playback-logs")
@PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
public class AdminPlaybackController {

    private final PlaybackService playback;

    public AdminPlaybackController(PlaybackService playback) {
        this.playback = playback;
    }

    @GetMapping
    public PageResponse<PlaybackLogResponse> list(
            @RequestParam(required = false) Long poiId,
            @RequestParam(required = false) TriggerType triggerType,
            @RequestParam(required = false) String languageCode,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return playback.search(poiId, triggerType, languageCode, from, to, page, size);
    }
}
