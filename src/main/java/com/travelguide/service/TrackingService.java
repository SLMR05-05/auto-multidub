package com.travelguide.service;

import com.travelguide.dto.IngestDtos.*;
import com.travelguide.entity.Device;
import com.travelguide.entity.LocationPoint;
import com.travelguide.entity.TrackingSession;
import com.travelguide.repository.LocationPointRepository;
import com.travelguide.repository.TrackingSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TrackingService {

    private final TrackingSessionRepository sessions;
    private final LocationPointRepository points;
    private final DeviceService devices;

    public TrackingService(TrackingSessionRepository sessions, LocationPointRepository points,
                           DeviceService devices) {
        this.sessions = sessions;
        this.points = points;
        this.devices = devices;
    }

    @Transactional
    public TrackingSessionResponse start(TrackingSessionRequest request) {
        Device device = devices.getOrCreate(request.deviceId());
        if (!device.isAnalyticsConsent()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Analytics consent is disabled");
        }
        TrackingSession session = sessions.findById(request.id()).orElseGet(() -> {
            TrackingSession created = new TrackingSession();
            created.setId(request.id());
            created.setDeviceId(request.deviceId());
            created.setStartedAt(request.startedAt() == null ? LocalDateTime.now() : request.startedAt());
            return sessions.save(created);
        });
        if (!session.getDeviceId().equals(request.deviceId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Tracking session belongs to another device");
        }
        return new TrackingSessionResponse(session.getId(), session.getDeviceId(),
                session.getStartedAt(), session.getEndedAt(),
                (int) points.countBySessionId(session.getId()));
    }

    @Transactional
    public TrackingSessionResponse addPoints(String sessionId, TrackingPointsRequest request) {
        TrackingSession session = sessions.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tracking session not found"));
        if (session.getEndedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tracking session has already ended");
        }
        Device device = devices.getOrCreate(session.getDeviceId());
        if (!device.isAnalyticsConsent()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Analytics consent is disabled");
        }

        List<LocationPoint> batch = new ArrayList<>();
        for (TrackingPointRequest item : request.points()) {
            LocationPoint point = new LocationPoint();
            point.setSessionId(sessionId);
            point.setDeviceId(session.getDeviceId());
            point.setLatitude(item.latitude());
            point.setLongitude(item.longitude());
            point.setAccuracy(item.accuracy());
            point.setRecordedAt(item.recordedAt());
            batch.add(point);
        }
        points.saveAll(batch);
        devices.touch(session.getDeviceId());
        return new TrackingSessionResponse(session.getId(), session.getDeviceId(),
                session.getStartedAt(), session.getEndedAt(),
                (int) points.countBySessionId(sessionId));
    }

    @Transactional
    public TrackingSessionResponse end(String sessionId, LocalDateTime endedAt) {
        TrackingSession session = sessions.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tracking session not found"));
        if (session.getEndedAt() == null) {
            session.setEndedAt(endedAt == null ? LocalDateTime.now() : endedAt);
            sessions.save(session);
        }
        return new TrackingSessionResponse(session.getId(), session.getDeviceId(),
                session.getStartedAt(), session.getEndedAt(),
                (int) points.countBySessionId(sessionId));
    }
}
