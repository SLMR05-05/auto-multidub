package com.travelguide.controller;

import com.travelguide.dto.ApiDtos.*;
import com.travelguide.entity.AppUser;
import com.travelguide.service.CurrentUserService;
import com.travelguide.service.TranslationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/translations")
public class TranslationController {
    private final TranslationService service;
    private final CurrentUserService currentUser;
    public TranslationController(TranslationService service, CurrentUserService currentUser) {
        this.service = service; this.currentUser = currentUser;
    }

    @PostMapping
    public TranslationResponse translate(@Valid @RequestBody TranslationRequest request) {
        AppUser user = currentUser.get();
        return service.translate(request, user.getId());
    }
}
