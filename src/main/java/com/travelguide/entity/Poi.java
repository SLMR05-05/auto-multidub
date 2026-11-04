package com.travelguide.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Point of Interest - the central narration unit of the PRD.
 * Geofence radius and priority are configurable per POI.
 */
@Entity
@Table(name = "pois", indexes = {
        @Index(name = "idx_poi_status", columnList = "status"),
        @Index(name = "idx_poi_version", columnList = "version"),
        @Index(name = "idx_poi_ward", columnList = "ward_id")
})
public class Poi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String code;

    /** Vietnamese base name, also used for CMS lists and search. */
    @Column(nullable = false, length = 250)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id")
    private Ward ward;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_stop_id")
    private BusStop busStop;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    /** PRD P1: 20 - 300 m, default 50 m. */
    @Column(nullable = false)
    private int radiusMeters = 50;

    /** PRD: 1 (lowest) - 5 (highest), default 3. */
    @Column(nullable = false)
    private int priority = 3;

    /** Optional per-POI cooldown override (PRD P4). Null = global setting. */
    @Column(name = "cooldown_minutes")
    private Integer cooldownMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PoiStatus status = PoiStatus.DRAFT;

    /**
     * Content version at which this POI last changed. The mobile app compares
     * this with its local version to perform delta sync.
     */
    @Column(nullable = false)
    private long version = 0;

    @Column(nullable = false)
    private boolean previouslyPublished = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Ward getWard() { return ward; }
    public void setWard(Ward ward) { this.ward = ward; }
    public BusStop getBusStop() { return busStop; }
    public void setBusStop(BusStop busStop) { this.busStop = busStop; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public int getRadiusMeters() { return radiusMeters; }
    public void setRadiusMeters(int radiusMeters) { this.radiusMeters = radiusMeters; }
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
    public Integer getCooldownMinutes() { return cooldownMinutes; }
    public void setCooldownMinutes(Integer cooldownMinutes) { this.cooldownMinutes = cooldownMinutes; }
    public PoiStatus getStatus() { return status; }
    public void setStatus(PoiStatus status) { this.status = status; }
    public long getVersion() { return version; }
    public void setVersion(long version) { this.version = version; }
    public boolean isPreviouslyPublished() { return previouslyPublished; }
    public void setPreviouslyPublished(boolean previouslyPublished) { this.previouslyPublished = previouslyPublished; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
