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

    @Column(name = "device_type", length = 30)
    private String deviceType = "WEB";

    @Column(name = "os_version", length = 50)
    private String osVersion;

    @Column(name = "app_version", length = 20)
    private String appVersion;

    @Column(name = "preferred_language", length = 10)
    private String preferredLanguage = "vi";

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public boolean isAnalyticsConsent() { return analyticsConsent; }
    public void setAnalyticsConsent(boolean analyticsConsent) { this.analyticsConsent = analyticsConsent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
    public LocalDateTime getConsentUpdatedAt() { return consentUpdatedAt; }
    public void setConsentUpdatedAt(LocalDateTime consentUpdatedAt) { this.consentUpdatedAt = consentUpdatedAt; }
    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }
    public String getOsVersion() { return osVersion; }
    public void setOsVersion(String osVersion) { this.osVersion = osVersion; }
    public String getAppVersion() { return appVersion; }
    public void setAppVersion(String appVersion) { this.appVersion = appVersion; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
}
