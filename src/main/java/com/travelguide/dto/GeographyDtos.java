package com.travelguide.dto;

import jakarta.validation.constraints.*;

public class GeographyDtos {

    public record WardRequest(
            @NotBlank @Size(max = 40) String code,
            @NotBlank @Size(max = 150) String name,
            @Size(max = 150) String district
    ) {
    }

    public record WardResponse(Long id, String code, String name, String district) {
    }

    public record BusStopRequest(
            @NotBlank @Size(max = 40) String code,
            @NotBlank @Size(max = 200) String name,
            Long wardId,
            @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 300) String note
    ) {
    }

    public record BusStopResponse(
            Long id,
            String code,
            String name,
            Long wardId,
            String wardName,
            double latitude,
            double longitude,
            String note
    ) {
    }
}
