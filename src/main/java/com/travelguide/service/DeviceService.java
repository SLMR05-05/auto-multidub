package com.travelguide.service;

import com.travelguide.dto.IngestDtos.*;
import com.travelguide.entity.Device;
import com.travelguide.repository.DeviceRepository;
import com.travelguide.repository.LocationPointRepository;
import com.travelguide.repository.PlaybackLogRepository;
import com.travelguide.repository.TrackingSessionRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

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

    @Transactional(readOnly = true)
    public AdminDeviceSummary listAdminDevices(String search, String type, String os) {
        List<Device> all = devices.findAll(Sort.by(Sort.Direction.DESC, "lastSeenAt"));
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);

        List<AdminDeviceItem> items = all.stream()
                .filter(d -> {
                    if (search != null && !search.isBlank()) {
                        String s = search.trim().toLowerCase();
                        boolean matchId = d.getDeviceId() != null && d.getDeviceId().toLowerCase().contains(s);
                        boolean matchOs = d.getOsVersion() != null && d.getOsVersion().toLowerCase().contains(s);
                        boolean matchLang = d.getPreferredLanguage() != null && d.getPreferredLanguage().toLowerCase().contains(s);
                        if (!matchId && !matchOs && !matchLang) return false;
                    }
                    if (type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type)) {
                        String t = d.getDeviceType() == null ? "WEB" : d.getDeviceType();
                        if (!t.equalsIgnoreCase(type.trim())) return false;
                    }
                    if (os != null && !os.isBlank() && !"ALL".equalsIgnoreCase(os)) {
                        String deviceOs = d.getOsVersion() == null ? "" : d.getOsVersion().toLowerCase();
                        if (!deviceOs.contains(os.trim().toLowerCase())) return false;
                    }
                    return true;
                })
                .map(d -> {
                    long playbacks = playbackLogs.countByDeviceId(d.getDeviceId());
                    long sessionCount = sessions.countByDeviceId(d.getDeviceId());
                    boolean online = d.getLastSeenAt() != null && d.getLastSeenAt().isAfter(fifteenMinutesAgo);
                    return new AdminDeviceItem(
                            d.getDeviceId(),
                            d.getDeviceType() == null ? "WEB" : d.getDeviceType(),
                            d.getOsVersion(),
                            d.getAppVersion(),
                            d.getPreferredLanguage(),
                            d.isAnalyticsConsent(),
                            playbacks,
                            sessionCount,
                            d.getCreatedAt(),
                            d.getLastSeenAt(),
                            online
                    );
                })
                .toList();

        long onlineCount = all.stream()
                .filter(d -> d.getLastSeenAt() != null && d.getLastSeenAt().isAfter(fifteenMinutesAgo))
                .count();
        long webCount = all.stream()
                .filter(d -> !"APP".equalsIgnoreCase(d.getDeviceType()) && !"MOBILE_APP".equalsIgnoreCase(d.getDeviceType()))
                .count();
        long appCount = all.stream()
                .filter(d -> "APP".equalsIgnoreCase(d.getDeviceType()) || "MOBILE_APP".equalsIgnoreCase(d.getDeviceType()))
                .count();

        return new AdminDeviceSummary(all.size(), onlineCount, webCount, appCount, items);
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
