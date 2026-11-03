package com.travelguide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ApiDtos {
    public record CreateLocationRequest(@NotBlank @Size(max=150) String name,
                                        String city, String country, String description) {}
    public record CreateGuideRequest(@NotNull Long locationId,
                                     @NotBlank @Size(max=200) String title,
                                     @NotBlank String sourceLanguage,
                                     @NotBlank String content) {}
    public record TranslationRequest(Long guideId,
                                     @NotBlank String text,
                                     @NotBlank String sourceLanguage,
                                     @NotBlank String targetLanguage) {}
    public record TranslationResponse(Long id, String originalText, String translatedText,
                                      String sourceLanguage, String targetLanguage, String provider) {}
    public record SpeechRequest(@NotNull Long translationId, String voiceName) {}
    public record AudioResponse(Long id, Long translationId, String languageCode,
                                String format, String streamUrl) {}
    public record MessageResponse(String message) {}
}
