package com.travelguide.dto;

import com.travelguide.util.LanguageCatalog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class SyncDtos {

    public record AppConfigResponse(
            long dataVersion,
            List<LanguageCatalog.Language> languages,
            Map<String, String> settings
    ) {
    }

    public record SyncPoi(
            Long id,
            String code,
            String name,
            String localizedName,
            String description,
            String ttsScript,
            String languageCode,
            boolean missingTranslation,
            double latitude,
            double longitude,
            int radiusMeters,
            int priority,
            Integer cooldownMinutes,
            String status,
            Long wardId,
            String wardName,
            Long busStopId,
            String busStopName,
            String coverImageUrl,
            long version,
            List<PoiDtos.AudioResponse> audios,
            List<PoiDtos.ImageResponse> images,
            List<Long> tourIds
    ) {
    }

    public record SyncQr(
            Long id,
            String code,
            Long poiId,
            Long busStopId,
            boolean active,
            String label,
            long version
    ) {
    }

    public record SyncPackage(
            Long id,
            String code,
            String name,
            String languageCode,
            long dataVersion,
            long sizeBytes,
            String checksumSha256,
            int poiCount,
            String downloadUrl
    ) {
    }

    public record SyncResponse(
            long dataVersion,
            long sinceVersion,
            LocalDateTime generatedAt,
            AppConfigResponse config,
            List<SyncPoi> pois,
            List<TourDtos.TourResponse> tours,
            List<SyncQr> qrCodes,
            List<SyncPackage> offlinePackages
    ) {
    }
}
