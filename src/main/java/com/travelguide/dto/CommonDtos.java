package com.travelguide.dto;

import java.util.List;

public class CommonDtos {

    public record PageResponse<T>(
            List<T> content,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {
        public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
            return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                    page.getTotalElements(), page.getTotalPages());
        }
    }

    public record MessageResponse(String message) {
    }

    public record ValidationError(String field, String message) {
    }
}
