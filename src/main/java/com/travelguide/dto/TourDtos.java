package com.travelguide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class TourDtos {

    public record TourRequest(
            @Size(max = 120) String code,
            @NotBlank @Size(max = 250) String name,
            String description
    ) {
    }

    public record TourPoiItem(
            Long poiId,
            String code,
            String name,
            int orderIndex,
            double latitude,
            double longitude,
            String coverImageUrl
    ) {
    }

    public record TourResponse(
            Long id,
            String code,
            String name,
            String description,
            String status,
            long version,
            List<TourPoiItem> pois,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }

    public record TourOrderRequest(@NotNull List<Long> poiIds) {
    }
}
