package com.travelguide.controller;

import com.travelguide.dto.ApiDtos.CreateGuideRequest;
import com.travelguide.entity.Guide;
import com.travelguide.service.GuideService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/guides")
public class GuideController {
    private final GuideService service;
    public GuideController(GuideService service) { this.service = service; }

    @GetMapping public List<Guide> all(@RequestParam(required=false) Long locationId) { return service.findAll(locationId); }
    @GetMapping("/{id}") public Guide one(@PathVariable Long id) { return service.findById(id); }
    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public Guide create(@Valid @RequestBody CreateGuideRequest request) { return service.create(request); }
}
