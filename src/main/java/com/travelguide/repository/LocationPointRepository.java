package com.travelguide.repository;

import com.travelguide.entity.LocationPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LocationPointRepository extends JpaRepository<LocationPoint, Long> {

    List<LocationPoint> findByRecordedAtBetweenOrderBySessionIdAscRecordedAtAsc(LocalDateTime from, LocalDateTime to);

    List<LocationPoint> findByDeviceIdOrderByRecordedAtAsc(String deviceId);

    long deleteByRecordedAtBefore(LocalDateTime cutoff);

    long countByDeviceId(String deviceId);

    long countBySessionId(String sessionId);

    long countByRecordedAtBetween(LocalDateTime from, LocalDateTime to);

    void deleteByDeviceId(String deviceId);
}
