package com.travelguide.controller;

import com.travelguide.dto.CommonDtos.MessageResponse;
import com.travelguide.dto.QrDtos.CreateRequest;
import com.travelguide.dto.QrDtos.QrResponse;
import com.travelguide.dto.QrDtos.ScanStat;
import com.travelguide.entity.QrCode;
import com.travelguide.service.AnalyticsService;
import com.travelguide.service.QrCodeService;
import com.travelguide.service.QrImageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/qr-codes")
@PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
public class AdminQrController {

    private final QrCodeService qrCodes;
    private final QrImageService qrImages;
    private final AnalyticsService analytics;

    public AdminQrController(QrCodeService qrCodes, QrImageService qrImages, AnalyticsService analytics) {
        this.qrCodes = qrCodes;
        this.qrImages = qrImages;
        this.analytics = analytics;
    }

    @GetMapping
    public List<QrResponse> list() {
        return qrCodes.list();
    }

    @PostMapping
    public QrResponse create(@Valid @RequestBody CreateRequest request) {
        return qrCodes.create(request);
    }

    @GetMapping("/{id}")
    public QrResponse get(@PathVariable Long id) {
        return qrCodes.get(id);
    }

    @PutMapping("/{id}/active")
    public QrResponse setActive(@PathVariable Long id, @RequestParam boolean active) {
        return qrCodes.setActive(id, active);
    }

    @DeleteMapping("/{id}")
    public MessageResponse delete(@PathVariable Long id) {
        qrCodes.delete(id);
        return new MessageResponse("QR code deactivated");
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> image(@PathVariable Long id,
                                        @RequestParam(defaultValue = "png") String format,
                                        @RequestParam(defaultValue = "512") int size) {
        QrCode qr = qrCodes.find(id);
        int safeSize = Math.min(Math.max(size, 128), 2048);
        String content = qrCodes.url(qr.getCode());
        if ("svg".equalsIgnoreCase(format)) {
            byte[] body = qrImages.svg(content, safeSize).getBytes(StandardCharsets.UTF_8);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("image/svg+xml"))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"qr-" + qr.getCode() + ".svg\"")
                    .body(body);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"qr-" + qr.getCode() + ".png\"")
                .body(qrImages.png(content, safeSize));
    }

    @GetMapping("/{id}/print")
    public ResponseEntity<byte[]> print(@PathVariable Long id) {
        QrCode qr = qrCodes.find(id);
        String title = qr.getBusStop() != null ? qr.getBusStop().getName()
                : qr.getPoi() != null ? qr.getPoi().getName() : qr.getLabel();
        String subtitle = qr.getPoi() != null ? qr.getPoi().getName() : "";
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"qr-print-" + qr.getCode() + ".png\"")
                .body(qrImages.printPng(qr, title, subtitle));
    }

    @GetMapping("/stats")
    public List<ScanStat> stats(@RequestParam(required = false) LocalDate from,
                                @RequestParam(required = false) LocalDate to) {
        return analytics.qrStats(from, to);
    }
}
