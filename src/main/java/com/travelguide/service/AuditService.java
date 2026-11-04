package com.travelguide.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelguide.entity.AppUser;
import com.travelguide.entity.AuditLog;
import com.travelguide.repository.AuditLogRepository;
import com.travelguide.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Append-only audit trail (FR-CMS-20). No update/delete methods exist.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogs;
    private final UserRepository users;
    private final ObjectMapper objectMapper;

    public AuditService(AuditLogRepository auditLogs, UserRepository users, ObjectMapper objectMapper) {
        this.auditLogs = auditLogs;
        this.users = users;
        this.objectMapper = objectMapper;
    }

    public void record(String action, String entityType, Object entityId, Object before, Object after) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId == null ? null : String.valueOf(entityId));
        log.setBeforeData(toJson(before));
        log.setAfterData(toJson(after));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            log.setActorEmail(email);
            users.findByEmail(email).map(AppUser::getId).ifPresent(log::setActorId);
        } else {
            log.setActorEmail("system");
        }
        auditLogs.save(log);
    }

    public Page<AuditLog> search(String actor, String entityType, String action,
                                 LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return auditLogs.search(emptyToNull(actor), emptyToNull(entityType), emptyToNull(action),
                from, to, pageable);
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            return "\"<unserializable>\"";
        }
    }
}
