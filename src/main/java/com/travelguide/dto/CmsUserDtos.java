package com.travelguide.dto;

import com.travelguide.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CmsUserDtos {

    public record CreateRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(max = 100) String fullName,
            @NotNull Role role
    ) {
    }

    public record UpdateRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotNull Role role,
            boolean active
    ) {
    }

    public record PasswordRequest(@NotBlank @Size(min = 8, max = 72) String password) {
    }

    public record Response(
            Long id,
            String email,
            String fullName,
            String role,
            boolean active,
            int failedLoginAttempts,
            LocalDateTime lockedUntil,
            LocalDateTime createdAt
    ) {
    }
}
