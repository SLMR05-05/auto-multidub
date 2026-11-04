package com.travelguide.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public class PoiDtos {

    public record PoiRequest(
            @Size(max = 120) String code,
            @NotBlank @Size(max = 250) String name,
            Long wardId,
            Long busStopId,
            @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @NotNull @Min(20) @Max(300) Integer radiusMeters,
            @NotNull @Min(1) @Max(5) Integer priority,
            @Min(1) @Max(1440) Integer cooldownMinutes
    ) {
    }

    public record TranslationRequest(
            @NotBlank @Size(max = 250) String name,
            String description,
            String ttsScript
    ) {
    }

    public record TranslationResponse(
            Long id,
            String languageCode,
            String name,
            String description,
            String ttsScript,
            boolean complete,
            LocalDateTime updatedAt
    ) {
    }

    public record AudioResponse(
            Long id,
            String languageCode,
            String fileName,
            String contentType,
            String format,
            long sizeBytes,
            double durationSeconds,
            String checksumSha256,
            String streamUrl
    ) {
    }

    public record ImageResponse(
            Long id,
            String fileName,
            String contentType,
            long sizeBytes,
            int sortOrder,
            boolean coverImage,
            String url
    ) {
    }

    public record TourRef(
            Long id,
            String code,
            String name,
            int orderIndex
    ) {
    }

    public record Summary(
            Long id,
            String code,
            String name,
            String description,
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
            Double distanceMeters,
            long version,
            LocalDateTime updatedAt
    ) {
    }

    public record Detail(
            Summary summary,
            String ttsScript,
            String fallbackLabel,
            List<AudioResponse> audios,
            List<ImageResponse> images,
            List<TourRef> tours
    ) {
    }

    public record AdminResponse(
            Long id,
            String code,
            String name,
            String status,
            double latitude,
            double longitude,
            int radiusMeters,
            int priority,
            Integer cooldownMinutes,
            Long wardId,
            String wardName,
            Long busStopId,
            String busStopName,
            long version,
            boolean previouslyPublished,
            int translationCount,
            int audioCount,
            int imageCount,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }

    public record CoverageCell(
            String languageCode,
            boolean hasTranslation,
            boolean hasAudio,
            boolean hasTtsScript
    ) {
    }

    public record CoverageResponse(
            Long poiId,
            String poiCode,
            String poiName,
            int translationCount,
            int audioCount,
            List<CoverageCell> languages
    ) {
    }

    public record PublishIssue(Long poiId, String poiCode, String message) {
    }

    public record PublishResult(long dataVersion, int publishedCount, List<PublishIssue> issues) {
    }

    public record ImageOrderRequest(@NotNull List<Long> imageIds) {
    }
}
