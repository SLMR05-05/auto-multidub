package com.travelguide.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "translations")
public class Translation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long guideId;
    @Column(nullable = false, length = 10)
    private String sourceLanguage;
    @Column(nullable = false, length = 10)
    private String targetLanguage;
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String originalText;
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String translatedText;
    @Column(nullable = false, length = 40)
    private String provider = "GOOGLE_CLOUD_TRANSLATION";
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getGuideId() { return guideId; }
    public void setGuideId(Long guideId) { this.guideId = guideId; }
    public String getSourceLanguage() { return sourceLanguage; }
    public void setSourceLanguage(String sourceLanguage) { this.sourceLanguage = sourceLanguage; }
    public String getTargetLanguage() { return targetLanguage; }
    public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }
    public String getTranslatedText() { return translatedText; }
    public void setTranslatedText(String translatedText) { this.translatedText = translatedText; }
    public String getProvider() { return provider; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
