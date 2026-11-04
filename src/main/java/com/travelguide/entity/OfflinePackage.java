package com.travelguide.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "offline_packages", indexes = {
        @Index(name = "idx_package_lang", columnList = "language_code"),
        @Index(name = "idx_package_status", columnList = "status")
})
public class OfflinePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String code;

    @Column(nullable = false, length = 250)
    private String name;

    private Long tourId;

    private Long wardId;

    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode;

    /** Snapshot of the global data version this package was built from. */
    @Column(nullable = false)
    private long dataVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PackageStatus status = PackageStatus.BUILDING;

    @Column(length = 700)
    private String filePath;

    @Column(nullable = false)
    private long sizeBytes;

    @Column(length = 64)
    private String checksumSha256;

    @Column(nullable = false)
    private int poiCount;

    @Column(length = 500)
    private String errorMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime builtAt;

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getTourId() { return tourId; }
    public void setTourId(Long tourId) { this.tourId = tourId; }
    public Long getWardId() { return wardId; }
    public void setWardId(Long wardId) { this.wardId = wardId; }
    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }
    public long getDataVersion() { return dataVersion; }
    public void setDataVersion(long dataVersion) { this.dataVersion = dataVersion; }
    public PackageStatus getStatus() { return status; }
    public void setStatus(PackageStatus status) { this.status = status; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    public String getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; }
    public int getPoiCount() { return poiCount; }
    public void setPoiCount(int poiCount) { this.poiCount = poiCount; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getBuiltAt() { return builtAt; }
    public void setBuiltAt(LocalDateTime builtAt) { this.builtAt = builtAt; }
}
