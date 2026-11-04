package com.travelguide.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class AnalyticsDtos {

    public record DashboardResponse(
            LocalDate from,
            LocalDate to,
            long sessions,
            long totalListens,
            long validListens,
            long qrScans,
            long uniqueDevices,
            Map<String, Long> triggerDistribution,
            Map<String, Long> languageDistribution
    ) {
    }

    public record TopPoiItem(
            Long poiId,
            String poiCode,
            String poiName,
            long validListens,
            double avgListenedSeconds,
            double completionRate
    ) {
    }

    public record TopPoisResponse(
            LocalDate from,
            LocalDate to,
            List<TopPoiItem> items
    ) {
    }

    public record HeatmapCell(
            double latitude,
            double longitude,
            long deviceCount,
            long pointCount
    ) {
    }

    public record HeatmapResponse(
            LocalDate from,
            LocalDate to,
            double cellSizeDegrees,
            int minDevices,
            List<HeatmapCell> cells
    ) {
    }

    public record TransitionItem(
            Long fromPoiId,
            String fromPoiName,
            Long toPoiId,
            String toPoiName,
            long count
    ) {
    }

    public record TransitionResponse(
            LocalDate from,
            LocalDate to,
            List<TransitionItem> items
    ) {
    }
}
