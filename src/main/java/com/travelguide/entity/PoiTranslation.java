package com.travelguide.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "poi_translations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_poi_translation_lang", columnNames = {"poi_id", "language_code"})
})
public class PoiTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poi_id", nullable = false)
    private Poi poi;

    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode;

    @Column(nullable = false, length = 250)
    private String name;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    /** Text used by on-device TTS when no recorded audio exists. */
    @Column(columnDefinition = "LONGTEXT")
    private String ttsScript;

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    @PrePersist
    void touch() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Poi getPoi() { return poi; }
    public void setPoi(Poi poi) { this.poi = poi; }
    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTtsScript() { return ttsScript; }
    public void setTtsScript(String ttsScript) { this.ttsScript = ttsScript; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
