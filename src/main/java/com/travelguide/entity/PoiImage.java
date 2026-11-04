package com.travelguide.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "poi_images", indexes = {
        @Index(name = "idx_poi_image_order", columnList = "poi_id, sort_order")
})
public class PoiImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poi_id", nullable = false)
    private Poi poi;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 700)
    private String filePath;

    @Column(nullable = false, length = 120)
    private String contentType;

    @Column(nullable = false)
    private long sizeBytes;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(nullable = false)
    private boolean coverImage = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Poi getPoi() { return poi; }
    public void setPoi(Poi poi) { this.poi = poi; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public boolean isCoverImage() { return coverImage; }
    public void setCoverImage(boolean coverImage) { this.coverImage = coverImage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
