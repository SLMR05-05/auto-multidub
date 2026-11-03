package com.travelguide.service;

import com.travelguide.dto.ApiDtos.CreateGuideRequest;
import com.travelguide.entity.Guide;
import com.travelguide.repository.GuideRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GuideService {
    private final GuideRepository guides;
    private final LocationService locations;
    public GuideService(GuideRepository guides, LocationService locations) { this.guides = guides; this.locations = locations; }
    public List<Guide> findAll(Long locationId) {
        return locationId == null ? guides.findAll() : guides.findByLocationId(locationId);
    }
    public Guide findById(Long id) {
        return guides.findById(id).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Guide not found"));
    }
    public Guide create(CreateGuideRequest request) {
        locations.findById(request.locationId());
        Guide guide = new Guide();
        guide.setLocationId(request.locationId()); guide.setTitle(request.title());
        guide.setSourceLanguage(request.sourceLanguage()); guide.setContent(request.content());
        return guides.save(guide);
    }
}
