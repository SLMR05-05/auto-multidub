package com.travelguide.controller;

import com.travelguide.dto.IngestDtos.*;
import com.travelguide.dto.PoiDtos;
import com.travelguide.dto.SyncDtos.AppConfigResponse;
import com.travelguide.dto.SyncDtos.SyncResponse;
import com.travelguide.dto.TourDtos.TourResponse;
import com.travelguide.entity.OfflinePackage;
import com.travelguide.entity.PackageStatus;
import com.travelguide.service.*;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/v1/app")
public class AppController {

    private final SyncService sync;
    private final PoiService pois;
    private final TourService tours;
    private final QrCodeService qrCodes;
    private final PlaybackService playback;
    private final TrackingService tracking;
    private final DeviceService devices;
    private final OfflinePackageService packages;
    private final GeofenceService geofence;

    public AppController(SyncService sync, PoiService pois, TourService tours,
                         QrCodeService qrCodes, PlaybackService playback,
                         TrackingService tracking, DeviceService devices,
                         OfflinePackageService packages, GeofenceService geofence) {
        this.sync = sync;
        this.pois = pois;
        this.tours = tours;
        this.qrCodes = qrCodes;
        this.playback = playback;
        this.tracking = tracking;
        this.devices = devices;
        this.packages = packages;
        this.geofence = geofence;
    }

    @GetMapping("/config")
    public AppConfigResponse config() {
        return sync.config();
    }

    @GetMapping("/sync")
    public SyncResponse sync(@RequestParam(defaultValue = "0") long sinceVersion,
                             @RequestParam(defaultValue = "vi") String lang) {
        return sync.sync(sinceVersion, lang);
    }

    @GetMapping("/pois")
    public List<PoiDtos.Summary> pois(@RequestParam(defaultValue = "vi") String lang,
                                      @RequestParam(required = false) Long tourId,
                                      @RequestParam(required = false) Double lat,
                                      @RequestParam(required = false) Double lng,
                                      @RequestParam(required = false) Double maxDistanceMeters,
                                      @RequestParam(defaultValue = "100") int limit) {
        return pois.publishedList(lang, tourId, lat, lng, maxDistanceMeters, limit);
    }

    @GetMapping("/pois/{id}")
    public PoiDtos.Detail poi(@PathVariable Long id,
                              @RequestParam(defaultValue = "vi") String lang) {
        return pois.publishedDetail(id, lang);
    }

    @GetMapping("/geofence")
    public com.travelguide.dto.GeofenceDtos.Response geofence(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "vi") String lang) {
        return geofence.evaluate(lat, lng, lang);
    }

    @GetMapping("/tours")
    public List<TourResponse> tours() {
        return tours.publicList();
    }

    @GetMapping("/tours/{id}")
    public TourResponse tour(@PathVariable Long id) {
        return tours.publicGet(id);
    }

    @GetMapping("/qr/{code}")
    public com.travelguide.dto.QrDtos.ResolveResponse qr(@PathVariable String code,
                                                         @RequestParam(defaultValue = "vi") String lang) {
        return qrCodes.resolve(code, lang);
    }

    @PostMapping("/playback-logs")
    public PlaybackBatchResponse playbackLogs(@Valid @RequestBody PlaybackBatchRequest request) {
        return playback.ingest(request);
    }

    @PostMapping("/tracking/sessions")
    public TrackingSessionResponse startSession(@Valid @RequestBody TrackingSessionRequest request) {
        return tracking.start(request);
    }

    @PostMapping("/tracking/sessions/{id}/points")
    public TrackingSessionResponse addPoints(@PathVariable String id,
                                             @Valid @RequestBody TrackingPointsRequest request) {
        return tracking.addPoints(id, request);
    }

    @PostMapping("/tracking/sessions/{id}/end")
    public TrackingSessionResponse endSession(@PathVariable String id,
                                              @RequestBody(required = false) TrackingSessionEndRequest request) {
        return tracking.end(id, request == null ? null : request.endedAt());
    }

    @GetMapping("/devices/{deviceId}")
    public DeviceResponse device(@PathVariable String deviceId) {
        return devices.get(deviceId);
    }

    @PutMapping("/devices/{deviceId}/consent")
    public DeviceResponse consent(@PathVariable String deviceId,
                                  @RequestBody ConsentRequest request) {
        return devices.setConsent(deviceId, request.analyticsConsent());
    }

    @DeleteMapping("/devices/{deviceId}/data")
    public DeleteDeviceResponse deleteDeviceData(@PathVariable String deviceId) {
        return devices.deleteData(deviceId);
    }

    @GetMapping("/offline-packages/{id}/download")
    public ResponseEntity<Resource> downloadPackage(@PathVariable Long id) {
        OfflinePackage pkg = packages.find(id);
        if (pkg.getStatus() != PackageStatus.READY || pkg.getFilePath() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package is not ready");
        }
        Path path = Path.of(pkg.getFilePath()).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package file missing");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pkg.getCode() + ".zip\"")
                .header("X-Checksum-SHA256", pkg.getChecksumSha256())
                .header("X-Data-Version", Long.toString(pkg.getDataVersion()))
                .body(new FileSystemResource(path));
    }
}
