package com.travelguide.controller;

import com.travelguide.dto.CmsUserDtos.*;
import com.travelguide.dto.CommonDtos.MessageResponse;
import com.travelguide.service.CmsUserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final CmsUserService users;

    public AdminUserController(CmsUserService users) {
        this.users = users;
    }

    @GetMapping
    public List<Response> list() {
        return users.list();
    }

    @PostMapping
    public Response create(@Valid @RequestBody CreateRequest request) {
        return users.create(request);
    }

    @PutMapping("/{id}")
    public Response update(@PathVariable Long id, @Valid @RequestBody UpdateRequest request) {
        return users.update(id, request);
    }

    @PutMapping("/{id}/password")
    public MessageResponse resetPassword(@PathVariable Long id, @Valid @RequestBody PasswordRequest request) {
        users.resetPassword(id, request);
        return new MessageResponse("Password updated");
    }
}
