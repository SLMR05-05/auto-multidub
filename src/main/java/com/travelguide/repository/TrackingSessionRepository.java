package com.travelguide.repository;

import com.travelguide.entity.TrackingSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TrackingSessionRepository extends JpaRepository<TrackingSession, String> {

    List<TrackingSession> findByStartedAtBetween(LocalDateTime from, LocalDateTime to);

    long countByStartedAtBetween(LocalDateTime from, LocalDateTime to);

    long countByDeviceId(String deviceId);

    List<TrackingSession> findByDeviceId(String deviceId);

    void deleteByDeviceId(String deviceId);
}
