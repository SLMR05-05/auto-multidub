package com.travelguide.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Anonymous mobile installation. The id is a random UUID generated on the
 * device; no personal data is ever stored here (PRD FR-ANA-01).
 */
@Entity
@Table(name = "devices")
public class Device {

    @Id
    @Column(name = "device_id", length = 64)
    private String deviceId;

    @Column(nullable = false)
    private boolean analyticsConsent = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime lastSeenAt = LocalDateTime.now();

    private LocalDateTime consentUpdatedAt;

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public boolean isAnalyticsConsent() { return analyticsConsent; }
    public void setAnalyticsConsent(boolean analyticsConsent) { this.analyticsConsent = analyticsConsent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
    public LocalDateTime getConsentUpdatedAt() { return consentUpdatedAt; }
    public void setConsentUpdatedAt(LocalDateTime consentUpdatedAt) { this.consentUpdatedAt = consentUpdatedAt; }
}
