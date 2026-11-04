package com.travelguide.dto;

import java.util.List;

public class GeofenceDtos {

    public record Candidate(
            Long poiId,
            String code,
            String name,
            double distanceMeters,
            int radiusMeters,
            int priority,
            Integer cooldownMinutes,
            boolean inside
    ) {
    }

    public record Response(
            double latitude,
            double longitude,
            double approachMarginMeters,
            List<Candidate> inside,
            List<Candidate> approaching
    ) {
    }
}
