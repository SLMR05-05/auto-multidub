package com.travelguide.controller;

import com.travelguide.dto.CommonDtos.MessageResponse;
import com.travelguide.dto.GeographyDtos.*;
import com.travelguide.service.BusStopService;
import com.travelguide.service.WardService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
public class AdminGeographyController {

    private final WardService wards;
    private final BusStopService busStops;

    public AdminGeographyController(WardService wards, BusStopService busStops) {
        this.wards = wards;
        this.busStops = busStops;
    }

    @GetMapping("/wards")
    public List<WardResponse> wards() {
        return wards.list();
    }

    @PostMapping("/wards")
    public WardResponse createWard(@Valid @RequestBody WardRequest request) {
        return wards.create(request);
    }

    @PutMapping("/wards/{id}")
    public WardResponse updateWard(@PathVariable Long id, @Valid @RequestBody WardRequest request) {
        return wards.update(id, request);
    }

    @DeleteMapping("/wards/{id}")
    public MessageResponse deleteWard(@PathVariable Long id) {
        wards.delete(id);
        return new MessageResponse("Ward deleted");
    }

    @GetMapping("/bus-stops")
    public List<BusStopResponse> busStops(@RequestParam(required = false) Long wardId) {
        return busStops.list(wardId);
    }

    @PostMapping("/bus-stops")
    public BusStopResponse createBusStop(@Valid @RequestBody BusStopRequest request) {
        return busStops.create(request);
    }

    @PutMapping("/bus-stops/{id}")
    public BusStopResponse updateBusStop(@PathVariable Long id, @Valid @RequestBody BusStopRequest request) {
        return busStops.update(id, request);
    }

    @DeleteMapping("/bus-stops/{id}")
    public MessageResponse deleteBusStop(@PathVariable Long id) {
        busStops.delete(id);
        return new MessageResponse("Bus stop deleted");
    }
}
