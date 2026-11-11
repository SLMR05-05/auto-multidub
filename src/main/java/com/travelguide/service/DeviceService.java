package com.travelguide.service;

import com.travelguide.dto.IngestDtos.*;
import com.travelguide.entity.Device;
import com.travelguide.repository.DeviceRepository;
import com.travelguide.repository.LocationPointRepository;
import com.travelguide.repository.PlaybackLogRepository;
import com.travelguide.repository.TrackingSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class DeviceService {

    private final DeviceRepository devices;
    private final PlaybackLogRepository playbackLogs;
    private final TrackingSessionRepository sessions;
    private final LocationPointRepository points;

    public DeviceService(DeviceRepository devices, PlaybackLogRepository playbackLogs,
                         TrackingSessionRepository sessions, LocationPointRepository points) {
        this.devices = devices;
        this.playbackLogs = playbackLogs;
        this.sessions = sessions;
        this.points = points;
    }

    @Transactional
    public Device getOrCreate(String deviceId) {
        validateDeviceId(deviceId);
        return devices.findById(deviceId).orElseGet(() -> {
            Device device = new Device();
            device.setDeviceId(deviceId);
            // Tracking is opt-in (FR-ANA-02): the app must explicitly enable consent.
            device.setAnalyticsConsent(false);
            return devices.save(device);
        });
    }

    @Transactional
    public Device touch(String deviceId) {
        return touch(deviceId, null, null, null);
    }

    @Transactional
    public Device touch(String deviceId, String deviceType, String osVersion, String appVersion) {
        Device device = getOrCreate(deviceId);
        device.setLastSeenAt(LocalDateTime.now());
        if (deviceType != null && !deviceType.isBlank()) {
            device.setDeviceType(deviceType.trim().toUpperCase());
        }
        if (osVersion != null && !osVersion.isBlank()) {
            device.setOsVersion(osVersion.trim());
        }
        if (appVersion != null && !appVersion.isBlank()) {
            device.setAppVersion(appVersion.trim());
        }
        return devices.save(device);
    }

    @Transactional
    public DeviceResponse register(DeviceRegisterRequest request) {
        validateDeviceId(request.deviceId());
        Device device = touch(request.deviceId(), request.deviceType(), request.osVersion(), request.appVersion());
        if (request.preferredLanguage() != null && !request.preferredLanguage().isBlank()) {
            device.setPreferredLanguage(request.preferredLanguage().trim());
        }
        if (request.analyticsConsent() != null) {
            device.setAnalyticsConsent(request.analyticsConsent());
            device.setConsentUpdatedAt(LocalDateTime.now());
        }
        device = devices.save(device);
        return toResponse(device);
    }

    @Transactional
    public DeviceResponse setConsent(String deviceId, boolean consent) {
        Device device = getOrCreate(deviceId);
        device.setAnalyticsConsent(consent);
        device.setConsentUpdatedAt(LocalDateTime.now());
        device = devices.save(device);
        return toResponse(device);
    }

    @Transactional(readOnly = true)
    public DeviceResponse get(String deviceId) {
        Device device = devices.findById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));
        return toResponse(device);
    }

    @Transactional(readOnly = true)
    public boolean hasAnalyticsConsent(String deviceId) {
        return devices.findById(deviceId).map(Device::isAnalyticsConsent).orElse(false);
    }

    /**
     * Privacy endpoint DELETE /v1/devices/{id}/data (NFR-PRV-03 / decision 15).
     * Removes all raw data linked to the anonymous device id.
     */
    @Transactional
    public DeleteDeviceResponse deleteData(String deviceId) {
        validateDeviceId(deviceId);
        long playbackCount = playbackLogs.countByDeviceId(deviceId);
        long sessionCount = sessions.countByDeviceId(deviceId);
        long pointCount = points.countByDeviceId(deviceId);

        playbackLogs.deleteByDeviceId(deviceId);
        points.deleteByDeviceId(deviceId);
        sessions.deleteByDeviceId(deviceId);
        if (devices.existsById(deviceId)) {
            devices.deleteById(deviceId);
        }

        return new DeleteDeviceResponse(deviceId, playbackCount, sessionCount, pointCount);
    }

    public DeviceResponse toResponse(Device device) {
        return new DeviceResponse(
                device.getDeviceId(),
                device.isAnalyticsConsent(),
                device.getDeviceType(),
                device.getOsVersion(),
                device.getAppVersion(),
                device.getPreferredLanguage(),
                device.getCreatedAt(),
                device.getLastSeenAt()
        );
    }

    private void validateDeviceId(String deviceId) {
        if (deviceId == null || deviceId.isBlank() || deviceId.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid device id");
        }
    }
}
