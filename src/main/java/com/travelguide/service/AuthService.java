package com.travelguide.service;

import com.travelguide.dto.AuthDtos.*;
import com.travelguide.entity.AppUser;
import com.travelguide.entity.Role;
import com.travelguide.repository.UserRepository;
import com.travelguide.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (users.existsByEmail(request.email().toLowerCase().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        AppUser user = new AppUser();
        user.setEmail(request.email().toLowerCase().trim());
        user.setPassword(encoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setRole(Role.USER);
        users.save(user);
        return response(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is disabled");
        }
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.LOCKED,
                    "Account is temporarily locked. Try again after " + user.getLockedUntil());
        }

        if (!encoder.matches(request.password(), user.getPassword())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
                user.setFailedLoginAttempts(0);
            }
            users.save(user);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        users.save(user);
        return response(user);
    }

    private AuthResponse response(AppUser user) {
        return new AuthResponse(jwt.generateToken(user.getEmail(), user.getId(), user.getRole().name()),
                "Bearer", user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
    }
}
