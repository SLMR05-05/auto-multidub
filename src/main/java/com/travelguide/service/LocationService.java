package com.travelguide.service;

import com.travelguide.dto.ApiDtos.CreateLocationRequest;
import com.travelguide.entity.Location;
import com.travelguide.repository.LocationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class LocationService {
    private final LocationRepository repository;
    public LocationService(LocationRepository repository) { this.repository = repository; }
    public List<Location> findAll() { return repository.findAll(); }
    public Location findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
    }
    public Location create(CreateLocationRequest request) {
        Location item = new Location();
        item.setName(request.name()); item.setCity(request.city());
        item.setCountry(request.country()); item.setDescription(request.description());
        return repository.save(item);
    }
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
        repository.deleteById(id);
    }
}
