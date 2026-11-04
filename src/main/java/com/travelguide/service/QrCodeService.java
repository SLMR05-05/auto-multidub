package com.travelguide.service;

import com.travelguide.dto.PoiDtos;
import com.travelguide.dto.QrDtos.CreateRequest;
import com.travelguide.dto.QrDtos.QrResponse;
import com.travelguide.dto.QrDtos.ResolveResponse;
import com.travelguide.entity.BusStop;
import com.travelguide.entity.Poi;
import com.travelguide.entity.QrCode;
import com.travelguide.repository.QrCodeRepository;
import com.travelguide.util.CodeUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class QrCodeService {

    private final QrCodeRepository qrCodes;
    private final PoiService poiService;
    private final BusStopService busStopService;
    private final DataVersionService versions;
    private final AuditService audit;
    private final String baseUrl;

    public QrCodeService(QrCodeRepository qrCodes, PoiService poiService,
                         BusStopService busStopService, DataVersionService versions,
                         AuditService audit,
                         @Value("${app.qr.base-url:https://auto-narration.local/q/}") String baseUrl) {
        this.qrCodes = qrCodes;
        this.poiService = poiService;
        this.busStopService = busStopService;
        this.versions = versions;
        this.audit = audit;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    }

    @Transactional(readOnly = true)
    public List<QrResponse> list() {
        return qrCodes.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public QrResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public QrResponse create(CreateRequest request) {
        Poi poi = poiService.find(request.poiId());
        BusStop busStop = request.busStopId() == null ? null : busStopService.find(request.busStopId());
        QrCode qr = new QrCode();
        qr.setCode(uniqueCode());
        qr.setPoi(poi);
        qr.setBusStop(busStop);
        qr.setLabel(label(request.label(), poi.getName()));
        qr.setActive(true);
        qr.setVersion(versions.next());
        qr = qrCodes.save(qr);
        audit.record("CREATE", "QR_CODE", qr.getId(), null, toResponse(qr));
        return toResponse(qr);
    }

    @Transactional
    public QrResponse setActive(Long id, boolean active) {
        QrCode qr = find(id);
        QrResponse before = toResponse(qr);
        qr.setActive(active);
        qr.setVersion(versions.next());
        qr = qrCodes.save(qr);
        audit.record(active ? "ENABLE" : "DISABLE", "QR_CODE", id, before, toResponse(qr));
        return toResponse(qr);
    }

    @Transactional
    public void delete(Long id) {
        QrCode qr = find(id);
        QrResponse before = toResponse(qr);
        // Physical QR codes may already be printed, so deletion deactivates
        // instead of hard-deleting the record (safe review + delta sync).
        qr.setActive(false);
        qr.setVersion(versions.next());
        qrCodes.save(qr);
        audit.record("DELETE", "QR_CODE", id, before, toResponse(qr));
    }

    @Transactional(readOnly = true)
    public ResolveResponse resolve(String code, String languageCode) {
        QrCode qr = qrCodes.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QR code not found"));
        if (!qr.isActive()) {
            throw new ResponseStatusException(HttpStatus.GONE, "QR code is disabled");
        }
        if (qr.getPoi() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "QR code is not linked to a POI");
        }
        PoiDtos.Detail detail = poiService.publishedDetail(qr.getPoi().getId(), languageCode);
        BusStop stop = qr.getBusStop();
        return new ResolveResponse(qr.getCode(), qr.getPoi().getId(), detail,
                stop == null ? null : stop.getId(),
                stop == null ? null : stop.getName(),
                "autonarration://poi/" + qr.getPoi().getId() + "?qr=" + qr.getCode(),
                qr.getLabel());
    }

    @Transactional(readOnly = true)
    public QrCode find(Long id) {
        return qrCodes.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QR code not found"));
    }

    public QrResponse toResponse(QrCode qr) {
        return new QrResponse(qr.getId(), qr.getCode(), url(qr.getCode()),
                qr.getPoi() == null ? null : qr.getPoi().getId(),
                qr.getPoi() == null ? null : qr.getPoi().getName(),
                qr.getBusStop() == null ? null : qr.getBusStop().getId(),
                qr.getBusStop() == null ? null : qr.getBusStop().getName(),
                qr.isActive(), qr.getLabel(), qr.getVersion(), qr.getCreatedAt());
    }

    public String url(String code) {
        return baseUrl + code;
    }

    private String label(String requested, String poiName) {
        String value = requested == null || requested.isBlank() ? poiName : requested;
        if (value == null) {
            return "";
        }
        return value.length() <= 30 ? value : value.substring(0, 30);
    }

    private String uniqueCode() {
        for (int i = 0; i < 10; i++) {
            String code = CodeUtils.randomBase62(10);
            if (!qrCodes.existsByCode(code)) {
                return code;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot generate unique QR code");
    }
}
