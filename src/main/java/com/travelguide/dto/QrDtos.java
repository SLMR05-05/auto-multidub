package com.travelguide.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class QrDtos {

    public record CreateRequest(
            @NotNull Long poiId,
            Long busStopId,
            @Size(max = 30) String label
    ) {
    }

    public record QrResponse(
            Long id,
            String code,
            String url,
            Long poiId,
            String poiName,
            Long busStopId,
            String busStopName,
            boolean active,
            String label,
            long version,
            LocalDateTime createdAt
    ) {
    }

    public record ResolveResponse(
            String code,
            Long poiId,
            PoiDtos.Detail poi,
            Long busStopId,
            String busStopName,
            String deepLink,
            String label
    ) {
    }

    public record ScanStat(
            Long qrId,
            String code,
            String label,
            Long poiId,
            Long busStopId,
            long scans
    ) {
    }
}
