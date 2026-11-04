package com.travelguide.controller;

import com.travelguide.dto.CommonDtos.MessageResponse;
import com.travelguide.dto.CommonDtos.PageResponse;
import com.travelguide.dto.TourDtos.*;
import com.travelguide.entity.TourStatus;
import com.travelguide.service.TourService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/tours")
@PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
public class AdminTourController {

    private final TourService tours;

    public AdminTourController(TourService tours) {
        this.tours = tours;
    }

    @GetMapping
    public PageResponse<TourResponse> list(@RequestParam(required = false) String search,
                                           @RequestParam(required = false) TourStatus status,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return tours.adminSearch(search, status, page, size);
    }

    @PostMapping
    public TourResponse create(@Valid @RequestBody TourRequest request) {
        return tours.create(request);
    }

    @GetMapping("/{id}")
    public TourResponse get(@PathVariable Long id) {
        return tours.adminGet(id);
    }

    @PutMapping("/{id}")
    public TourResponse update(@PathVariable Long id, @Valid @RequestBody TourRequest request) {
        return tours.update(id, request);
    }

    @PutMapping("/{id}/pois")
    public TourResponse setPois(@PathVariable Long id, @Valid @RequestBody TourOrderRequest request) {
        return tours.setPois(id, request.poiIds());
    }

    @PostMapping("/{id}/publish")
    public TourResponse publish(@PathVariable Long id) {
        return tours.publish(id);
    }

    @DeleteMapping("/{id}")
    public MessageResponse archive(@PathVariable Long id) {
        tours.archive(id);
        return new MessageResponse("Tour archived");
    }
}
