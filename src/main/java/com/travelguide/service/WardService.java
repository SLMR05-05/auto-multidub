package com.travelguide.service;

import com.travelguide.dto.GeographyDtos.BusStopResponse;
import com.travelguide.dto.GeographyDtos.WardRequest;
import com.travelguide.dto.GeographyDtos.WardResponse;
import com.travelguide.entity.Ward;
import com.travelguide.repository.BusStopRepository;
import com.travelguide.repository.PoiRepository;
import com.travelguide.repository.WardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WardService {

    private final WardRepository wards;
    private final BusStopRepository busStops;
    private final PoiRepository pois;
    private final AuditService audit;

    public WardService(WardRepository wards, BusStopRepository busStops, PoiRepository pois, AuditService audit) {
        this.wards = wards;
        this.busStops = busStops;
        this.pois = pois;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<WardResponse> list() {
        return wards.findAllByOrderByNameAsc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public WardResponse create(WardRequest request) {
        if (wards.existsByCode(request.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ward code already exists");
        }
        Ward ward = new Ward();
        ward.setCode(request.code().trim());
        ward.setName(request.name().trim());
        ward.setDistrict(request.district());
        ward = wards.save(ward);
        audit.record("CREATE", "WARD", ward.getId(), null, toResponse(ward));
        return toResponse(ward);
    }

    @Transactional
    public WardResponse update(Long id, WardRequest request) {
        Ward ward = find(id);
        WardResponse before = toResponse(ward);
        if (!ward.getCode().equals(request.code()) && wards.existsByCode(request.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ward code already exists");
        }
        ward.setCode(request.code().trim());
        ward.setName(request.name().trim());
        ward.setDistrict(request.district());
        WardResponse after = toResponse(wards.save(ward));
        audit.record("UPDATE", "WARD", id, before, after);
        return after;
    }

    @Transactional
    public void delete(Long id) {
        Ward ward = find(id);
        if (pois.existsByWardId(id) || busStops.existsByWardId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ward is referenced by POIs or bus stops; reassign them first");
        }
        audit.record("DELETE", "WARD", id, toResponse(ward), null);
        wards.delete(ward);
    }

    public Ward find(Long id) {
        return wards.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ward not found"));
    }

    public WardResponse toResponse(Ward ward) {
        return new WardResponse(ward.getId(), ward.getCode(), ward.getName(), ward.getDistrict());
    }

    public BusStopResponse toBusStopResponse(com.travelguide.entity.BusStop stop) {
        return new BusStopResponse(stop.getId(), stop.getCode(), stop.getName(),
                stop.getWard() == null ? null : stop.getWard().getId(),
                stop.getWard() == null ? null : stop.getWard().getName(),
                stop.getLatitude(), stop.getLongitude(), stop.getNote());
    }
}
