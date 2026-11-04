package com.travelguide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class PackageDtos {

    public record CreateRequest(
            @NotBlank @Size(max = 250) String name,
            Long tourId,
            Long wardId,
            @NotBlank @Size(max = 10) String languageCode
    ) {
    }

    public record Response(
            Long id,
            String code,
            String name,
            Long tourId,
            Long wardId,
            String languageCode,
            long dataVersion,
            String status,
            long sizeBytes,
            String checksumSha256,
            int poiCount,
            String errorMessage,
            String downloadUrl,
            LocalDateTime createdAt,
            LocalDateTime builtAt
    ) {
    }
}
