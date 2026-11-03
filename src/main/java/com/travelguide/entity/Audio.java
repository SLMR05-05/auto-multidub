package com.travelguide.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audios")
public class Audio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long translationId;
    @Column(nullable = false, length = 10)
    private String languageCode;
    @Column(nullable = false, length = 255)
    private String fileName;
    @Column(nullable = false, length = 600)
    private String filePath;
    @Column(nullable = false, length = 20)
    private String format = "mp3";
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Long getTranslationId() { return translationId; }
    public void setTranslationId(Long translationId) { this.translationId = translationId; }
    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFormat() { return format; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
