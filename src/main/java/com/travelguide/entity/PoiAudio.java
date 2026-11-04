package com.travelguide.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "poi_audios", uniqueConstraints = {
        @UniqueConstraint(name = "uk_poi_audio_lang", columnNames = {"poi_id", "language_code"})
})
public class PoiAudio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poi_id", nullable = false)
    private Poi poi;

    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 700)
    private String filePath;

    @Column(nullable = false, length = 120)
    private String contentType = "audio/mpeg";

    @Column(nullable = false, length = 20)
    private String format = "mp3";

    @Column(nullable = false)
    private long sizeBytes;

    /** Duration in seconds, extracted on upload when possible. */
    @Column(nullable = false)
    private double durationSeconds;

    @Column(length = 64)
    private String checksumSha256;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Poi getPoi() { return poi; }
    public void setPoi(Poi poi) { this.poi = poi; }
    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    public double getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(double durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
