package com.travelguide.service;

import com.travelguide.dto.GeographyDtos.BusStopRequest;
import com.travelguide.dto.GeographyDtos.BusStopResponse;
import com.travelguide.entity.BusStop;
import com.travelguide.entity.Ward;
import com.travelguide.repository.BusStopRepository;
import com.travelguide.repository.PoiRepository;
import com.travelguide.repository.QrCodeRepository;
import com.travelguide.repository.WardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BusStopService {

    private final BusStopRepository busStops;
    private final WardRepository wards;
    private final PoiRepository pois;
    private final QrCodeRepository qrCodes;
    private final WardService wardService;
    private final AuditService audit;

    public BusStopService(BusStopRepository busStops, WardRepository wards, PoiRepository pois,
                          QrCodeRepository qrCodes, WardService wardService, AuditService audit) {
        this.busStops = busStops;
        this.wards = wards;
        this.pois = pois;
        this.qrCodes = qrCodes;
        this.wardService = wardService;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<BusStopResponse> list(Long wardId) {
        List<BusStop> result = wardId == null
                ? busStops.findAllByOrderByNameAsc()
                : busStops.findByWardIdOrderByNameAsc(wardId);
        return result.stream().map(wardService::toBusStopResponse).toList();
    }

    @Transactional
    public BusStopResponse create(BusStopRequest request) {
        if (busStops.existsByCode(request.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bus stop code already exists");
        }
        BusStop stop = new BusStop();
        apply(stop, request);
        stop = busStops.save(stop);
        audit.record("CREATE", "BUS_STOP", stop.getId(), null, wardService.toBusStopResponse(stop));
        return wardService.toBusStopResponse(stop);
    }

    @Transactional
    public BusStopResponse update(Long id, BusStopRequest request) {
        BusStop stop = find(id);
        BusStopResponse before = wardService.toBusStopResponse(stop);
        if (!stop.getCode().equals(request.code()) && busStops.existsByCode(request.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bus stop code already exists");
        }
        apply(stop, request);
        BusStopResponse after = wardService.toBusStopResponse(busStops.save(stop));
        audit.record("UPDATE", "BUS_STOP", id, before, after);
        return after;
    }

    @Transactional
    public void delete(Long id) {
        BusStop stop = find(id);
        if (pois.existsByBusStopId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bus stop is referenced by POIs; reassign them first");
        }
        if (qrCodes.existsByBusStopId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bus stop is referenced by QR codes; deactivate them first");
        }
        audit.record("DELETE", "BUS_STOP", id, wardService.toBusStopResponse(stop), null);
        busStops.delete(stop);
    }

    public BusStop find(Long id) {
        return busStops.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus stop not found"));
    }

    private void apply(BusStop stop, BusStopRequest request) {
        stop.setCode(request.code().trim());
        stop.setName(request.name().trim());
        stop.setLatitude(request.latitude());
        stop.setLongitude(request.longitude());
        stop.setNote(request.note());
        if (request.wardId() != null) {
            Ward ward = wards.findById(request.wardId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ward not found"));
            stop.setWard(ward);
        } else {
            stop.setWard(null);
        }
    }
}
