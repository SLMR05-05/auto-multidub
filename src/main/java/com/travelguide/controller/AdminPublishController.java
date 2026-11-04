package com.travelguide.controller;

import com.travelguide.dto.PoiDtos.PublishResult;
import com.travelguide.service.DataVersionService;
import com.travelguide.service.PoiService;
import com.travelguide.service.SystemSettingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
public class AdminPublishController {

    private final PoiService pois;
    private final DataVersionService versions;
    private final SystemSettingService settings;

    public AdminPublishController(PoiService pois, DataVersionService versions,
                                  SystemSettingService settings) {
        this.pois = pois;
        this.versions = versions;
        this.settings = settings;
    }

    /** CMS "Xuất bản": validates published POIs and increments data_version once. */
    @PostMapping("/publish")
    public PublishResult publish() {
        return pois.publishAll();
    }

    @GetMapping("/settings")
    public Map<String, String> settings() {
        return settings.all();
    }

    @PutMapping("/settings/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> updateSetting(@PathVariable String key,
                                             @RequestBody Map<String, String> body) {
        String value = body.get("value");
        if (value == null || value.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "value is required");
        }
        if (SystemSettingService.DATA_VERSION.equals(key)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "data_version is managed by the publish workflow");
        }
        settings.update(key, value);
        return Map.of("key", key, "value", settings.get(key),
                "dataVersion", Long.toString(versions.current()));
    }
}
