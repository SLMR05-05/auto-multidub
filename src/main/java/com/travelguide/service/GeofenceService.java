package com.travelguide.service;

import com.travelguide.dto.GeofenceDtos.Candidate;
import com.travelguide.dto.GeofenceDtos.Response;
import com.travelguide.dto.PoiDtos;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * Server-side reference implementation of the geofence selection rule
 * (FR-GEO-08): highest priority first, nearest second. The Android engine
 * performs the same calculation offline; this endpoint is useful for QA,
 * GPX replay and the CMS "simulate position" tool.
 */
@Service
public class GeofenceService {

    private final PoiService pois;
    private final SystemSettingService settings;

    public GeofenceService(PoiService pois, SystemSettingService settings) {
        this.pois = pois;
        this.settings = settings;
    }

    @Transactional(readOnly = true)
    public Response evaluate(double latitude, double longitude, String languageCode) {
        List<PoiDtos.Summary> candidates = pois.publishedList(languageCode, null,
                latitude, longitude, null, 500);
        double margin = settings.getDouble(SystemSettingService.APPROACH_MARGIN_METERS);

        List<Candidate> inside = candidates.stream()
                .filter(poi -> poi.distanceMeters() != null
                        && poi.distanceMeters() <= poi.radiusMeters())
                .sorted(Comparator.comparingInt(PoiDtos.Summary::priority).reversed()
                        .thenComparingDouble(PoiDtos.Summary::distanceMeters))
                .map(poi -> toCandidate(poi, true))
                .toList();

        List<Candidate> approaching = candidates.stream()
                .filter(poi -> poi.distanceMeters() != null
                        && poi.distanceMeters() > poi.radiusMeters()
                        && poi.distanceMeters() <= poi.radiusMeters() + margin)
                .sorted(Comparator.comparingDouble(PoiDtos.Summary::distanceMeters))
                .map(poi -> toCandidate(poi, false))
                .toList();

        return new Response(latitude, longitude, margin, inside, approaching);
    }

    private Candidate toCandidate(PoiDtos.Summary poi, boolean inside) {
        return new Candidate(poi.id(), poi.code(), poi.name(), poi.distanceMeters(),
                poi.radiusMeters(), poi.priority(), poi.cooldownMinutes(), inside);
    }
}
