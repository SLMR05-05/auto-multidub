package com.travelguide.service;

import com.travelguide.dto.SyncDtos.*;
import com.travelguide.dto.TourDtos;
import com.travelguide.entity.PackageStatus;
import com.travelguide.repository.OfflinePackageRepository;
import com.travelguide.repository.QrCodeRepository;
import com.travelguide.util.LanguageCatalog;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SyncService {

    private final PoiService poiService;
    private final TourService tourService;
    private final QrCodeRepository qrCodes;
    private final OfflinePackageRepository packages;
    private final DataVersionService versions;
    private final SystemSettingService settings;

    public SyncService(PoiService poiService, TourService tourService,
                       QrCodeRepository qrCodes, OfflinePackageRepository packages,
                       DataVersionService versions, SystemSettingService settings) {
        this.poiService = poiService;
        this.tourService = tourService;
        this.qrCodes = qrCodes;
        this.packages = packages;
        this.versions = versions;
        this.settings = settings;
    }

    @Transactional(readOnly = true)
    public AppConfigResponse config() {
        return new AppConfigResponse(versions.current(), LanguageCatalog.all(), settings.all());
    }

    @Transactional(readOnly = true)
    public SyncResponse sync(long sinceVersion, String languageCode) {
        String language = poiService.normalizeLanguage(languageCode);
        long since = Math.max(0, sinceVersion);
        long current = versions.current();

        List<SyncPoi> pois = poiService.syncPois(since, language);
        List<TourDtos.TourResponse> tours = tourService.syncTours(since);
        List<SyncQr> qrCodes = (since <= 0
                ? this.qrCodes.findAllByOrderByCreatedAtDesc()
                : this.qrCodes.findByVersionGreaterThanOrderByVersionAsc(since))
                .stream()
                .map(qr -> new SyncQr(qr.getId(), qr.getCode(),
                        qr.getPoi() == null ? null : qr.getPoi().getId(),
                        qr.getBusStop() == null ? null : qr.getBusStop().getId(),
                        qr.isActive(), qr.getLabel(), qr.getVersion()))
                .toList();
        List<SyncPackage> offlinePackages = packages.findByStatusOrderByCreatedAtDesc(PackageStatus.READY)
                .stream()
                .map(pkg -> new SyncPackage(pkg.getId(), pkg.getCode(), pkg.getName(),
                        pkg.getLanguageCode(), pkg.getDataVersion(), pkg.getSizeBytes(),
                        pkg.getChecksumSha256(), pkg.getPoiCount(),
                        "/api/v1/app/offline-packages/" + pkg.getId() + "/download"))
                .toList();

        return new SyncResponse(current, since, LocalDateTime.now(), config(),
                pois, tours, qrCodes, offlinePackages);
    }
}
