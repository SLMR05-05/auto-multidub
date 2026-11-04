package com.travelguide.controller;

import com.travelguide.dto.AnalyticsDtos.*;
import com.travelguide.service.AnalyticsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
public class AdminAnalyticsController {

    private final AnalyticsService analytics;

    public AdminAnalyticsController(AnalyticsService analytics) {
        this.analytics = analytics;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(@RequestParam(required = false) LocalDate from,
                                       @RequestParam(required = false) LocalDate to) {
        return analytics.dashboard(from, to);
    }

    @GetMapping("/top-pois")
    public TopPoisResponse topPois(@RequestParam(required = false) LocalDate from,
                                   @RequestParam(required = false) LocalDate to,
                                   @RequestParam(defaultValue = "10") int limit) {
        return analytics.topPois(from, to, limit);
    }

    @GetMapping("/heatmap")
    public HeatmapResponse heatmap(@RequestParam(required = false) LocalDate from,
                                   @RequestParam(required = false) LocalDate to,
                                   @RequestParam(required = false) Double cellSize,
                                   @RequestParam(required = false) Integer minDevices) {
        return analytics.heatmap(from, to, cellSize, minDevices);
    }

    @GetMapping("/transitions")
    public TransitionResponse transitions(@RequestParam(required = false) LocalDate from,
                                          @RequestParam(required = false) LocalDate to) {
        return analytics.transitions(from, to);
    }

    @GetMapping("/export.csv")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) LocalDate from,
                                         @RequestParam(required = false) LocalDate to) {
        byte[] csv = analytics.exportCsv(from, to).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"analytics.csv\"")
                .body(csv);
    }
}
