package com.travelguide.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_codes", indexes = {
        @Index(name = "idx_qr_poi", columnList = "poi_id"),
        @Index(name = "idx_qr_stop", columnList = "bus_stop_id")
})
public class QrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Base62 random code, at least 8 characters (PRD FR-QR-01). */
    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_id")
    private Poi poi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_stop_id")
    private BusStop busStop;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private long version = 0;

    @Column(nullable = false, length = 30)
    private String label = "";

    @Column(length = 150)
    private String createdBy;

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
    public Poi getPoi() { return poi; }
    public void setPoi(Poi poi) { this.poi = poi; }
    public BusStop getBusStop() { return busStop; }
    public void setBusStop(BusStop busStop) { this.busStop = busStop; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public long getVersion() { return version; }
    public void setVersion(long version) { this.version = version; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
