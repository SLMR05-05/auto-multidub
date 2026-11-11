package com.travelguide.dto;

import com.travelguide.entity.AudioMode;
import com.travelguide.entity.TriggerType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public class IngestDtos {

    public record PlaybackLogRequest(
            @NotBlank @Size(max = 64) String id,
            @NotBlank @Size(max = 64) String deviceId,
            @NotNull Long poiId,
            @NotNull TriggerType triggerType,
            @NotNull AudioMode audioMode,
            @NotBlank @Size(max = 10) String languageCode,
            @Size(max = 32) String qrCode,
            LocalDateTime startTime,
            LocalDateTime endTime,
            @Min(0) Integer listenedSeconds,
            Boolean completed,
            String deviceType,
            String osVersion
    ) {
    }

    public record PlaybackBatchRequest(
            @NotEmpty @Size(max = 500) List<@Valid PlaybackLogRequest> logs
    ) {
    }

    public record PlaybackBatchResponse(
            int accepted,
            int duplicates,
            int rejected,
            List<String> errors
    ) {
    }

    public record PlaybackLogResponse(
            String id,
            String deviceId,
            Long poiId,
            TriggerType triggerType,
            AudioMode audioMode,
            String languageCode,
            String qrCode,
            Long qrId,
            Long busStopId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            int listenedSeconds,
            boolean completed,
            boolean validListen
    ) {
    }

    public record ConsentRequest(boolean analyticsConsent) {
    }

    public record DeviceRegisterRequest(
            @NotBlank @Size(max = 64) String deviceId,
            String deviceType,
            String osVersion,
            String appVersion,
            String preferredLanguage,
            Boolean analyticsConsent
    ) {
    }

    public record DeviceResponse(
            String deviceId,
            boolean analyticsConsent,
            String deviceType,
            String osVersion,
            String appVersion,
            String preferredLanguage,
            LocalDateTime createdAt,
            LocalDateTime lastSeenAt
    ) {
    }

    public record DeleteDeviceResponse(
            String deviceId,
            long playbackLogsDeleted,
            long trackingSessionsDeleted,
            long locationPointsDeleted
    ) {
    }

    public record TrackingSessionRequest(
            @NotBlank @Size(max = 64) String id,
            @NotBlank @Size(max = 64) String deviceId,
            LocalDateTime startedAt
    ) {
    }

    public record TrackingPointRequest(
            @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @NotNull @DecimalMin("0.0") Double accuracy,
            @NotNull LocalDateTime recordedAt
    ) {
    }

    public record TrackingPointsRequest(
            @NotEmpty @Size(max = 500) List<@Valid TrackingPointRequest> points
    ) {
    }

    public record TrackingSessionEndRequest(LocalDateTime endedAt) {
    }

    public record TrackingSessionResponse(
            String id,
            String deviceId,
            LocalDateTime startedAt,
            LocalDateTime endedAt,
            int acceptedPoints
    ) {
    }
}
