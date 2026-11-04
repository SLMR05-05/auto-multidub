package com.travelguide.repository;

import com.travelguide.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("""
            select a from AuditLog a
            where (:actor is null or lower(a.actorEmail) like lower(concat('%', :actor, '%')))
              and (:entityType is null or a.entityType = :entityType)
              and (:action is null or a.action = :action)
              and (:from is null or a.createdAt >= :from)
              and (:to is null or a.createdAt < :to)
            """)
    Page<AuditLog> search(@Param("actor") String actor,
                         @Param("entityType") String entityType,
                         @Param("action") String action,
                         @Param("from") LocalDateTime from,
                         @Param("to") LocalDateTime to,
                         Pageable pageable);
}
