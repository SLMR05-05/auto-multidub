package com.travelguide.controller;

import com.travelguide.dto.ApiDtos.CreateLocationRequest;
import com.travelguide.entity.Location;
import com.travelguide.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {
    private final LocationService service;
    public LocationController(LocationService service) { this.service = service; }

    @GetMapping public List<Location> all() { return service.findAll(); }
    @GetMapping("/{id}") public Location one(@PathVariable Long id) { return service.findById(id); }
    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public Location create(@Valid @RequestBody CreateLocationRequest request) { return service.create(request); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
