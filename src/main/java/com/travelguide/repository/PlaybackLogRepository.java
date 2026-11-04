package com.travelguide.repository;

import com.travelguide.entity.PlaybackLog;
import com.travelguide.entity.TriggerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PlaybackLogRepository extends JpaRepository<PlaybackLog, String> {

    List<PlaybackLog> findByStartTimeBetweenOrderByStartTimeAsc(LocalDateTime from, LocalDateTime to);

    List<PlaybackLog> findByDeviceIdOrderByStartTimeAsc(String deviceId);

    long deleteByStartTimeBefore(LocalDateTime cutoff);

    long countByDeviceId(String deviceId);

    void deleteByDeviceId(String deviceId);

    @Query("""
            select l from PlaybackLog l
            where (:poiId is null or l.poiId = :poiId)
              and (:triggerType is null or l.triggerType = :triggerType)
              and (:languageCode is null or l.languageCode = :languageCode)
              and (:from is null or l.startTime >= :from)
              and (:to is null or l.startTime < :to)
            """)
    Page<PlaybackLog> search(@Param("poiId") Long poiId,
                            @Param("triggerType") TriggerType triggerType,
                            @Param("languageCode") String languageCode,
                            @Param("from") LocalDateTime from,
                            @Param("to") LocalDateTime to,
                            Pageable pageable);
}
