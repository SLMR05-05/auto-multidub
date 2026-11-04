package com.travelguide.service;

import com.travelguide.dto.CmsUserDtos.*;
import com.travelguide.entity.AppUser;
import com.travelguide.entity.Role;
import com.travelguide.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CmsUserService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final CurrentUserService currentUser;
    private final AuditService audit;

    public CmsUserService(UserRepository users, PasswordEncoder encoder,
                          CurrentUserService currentUser, AuditService audit) {
        this.users = users;
        this.encoder = encoder;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<Response> list() {
        return users.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public Response create(CreateRequest request) {
        if (users.existsByEmail(request.email().toLowerCase().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (request.role() == Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CMS accounts must use ADMIN, EDITOR or ANALYST");
        }
        AppUser user = new AppUser();
        user.setEmail(request.email().toLowerCase().trim());
        user.setPassword(encoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setRole(request.role());
        user = users.save(user);
        audit.record("CREATE", "CMS_USER", user.getId(), null, toResponse(user));
        return toResponse(user);
    }

    @Transactional
    public Response update(Long id, UpdateRequest request) {
        AppUser user = find(id);
        if (request.role() == Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CMS accounts must use ADMIN, EDITOR or ANALYST");
        }
        AppUser me = currentUser.get();
        if (user.getId().equals(me.getId()) && (request.role() != Role.ADMIN || !request.active())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You cannot remove your own admin access");
        }
        Response before = toResponse(user);
        user.setFullName(request.fullName().trim());
        user.setRole(request.role());
        user.setActive(request.active());
        user = users.save(user);
        Response after = toResponse(user);
        audit.record("UPDATE", "CMS_USER", id, before, after);
        return after;
    }

    @Transactional
    public void resetPassword(Long id, PasswordRequest request) {
        AppUser user = find(id);
        user.setPassword(encoder.encode(request.password()));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        users.save(user);
        audit.record("RESET_PASSWORD", "CMS_USER", id, null, null);
    }

    public AppUser find(Long id) {
        return users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public Response toResponse(AppUser user) {
        return new Response(user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(),
                user.isActive(), user.getFailedLoginAttempts(), user.getLockedUntil(), user.getCreatedAt());
    }
}
