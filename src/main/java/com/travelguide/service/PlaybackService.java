package com.travelguide.service;

import com.travelguide.dto.CommonDtos.PageResponse;
import com.travelguide.dto.IngestDtos.*;
import com.travelguide.entity.PlaybackLog;
import com.travelguide.entity.PoiAudio;
import com.travelguide.entity.QrCode;
import com.travelguide.entity.TriggerType;
import com.travelguide.repository.PlaybackLogRepository;
import com.travelguide.repository.PoiAudioRepository;
import com.travelguide.repository.PoiRepository;
import com.travelguide.repository.QrCodeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PlaybackService {

    private final PlaybackLogRepository logs;
    private final PoiRepository pois;
    private final PoiAudioRepository audios;
    private final QrCodeRepository qrCodes;
    private final DeviceService devices;
    private final PoiService poiService;
    private final SystemSettingService settings;

    public PlaybackService(PlaybackLogRepository logs, PoiRepository pois,
                           PoiAudioRepository audios, QrCodeRepository qrCodes,
                           DeviceService devices, PoiService poiService,
                           SystemSettingService settings) {
        this.logs = logs;
        this.pois = pois;
        this.audios = audios;
        this.qrCodes = qrCodes;
        this.devices = devices;
        this.poiService = poiService;
        this.settings = settings;
    }

    /**
     * Idempotent batch ingestion (FR-CON-09). Each log carries a client UUID;
     * duplicates are silently ignored.
     */
    @Transactional
    public PlaybackBatchResponse ingest(PlaybackBatchRequest request) {
        int accepted = 0;
        int duplicates = 0;
        int rejected = 0;
        List<String> errors = new ArrayList<>();
        int minListen = settings.getInt(SystemSettingService.MIN_VALID_LISTEN_SECONDS);

        for (PlaybackLogRequest item : request.logs()) {
            try {
                if (logs.existsById(item.id())) {
                    duplicates++;
                    continue;
                }
                if (!pois.existsById(item.poiId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "POI does not exist");
                }

                String language = poiService.normalizeLanguage(item.languageCode());
                LocalDateTime start = item.startTime() == null ? LocalDateTime.now() : item.startTime();
                LocalDateTime end = item.endTime();
                if (end != null && end.isBefore(start)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime is before startTime");
                }

                int listened = item.listenedSeconds() != null
                        ? Math.max(0, item.listenedSeconds())
                        : (int) Math.max(0, Duration.between(start, end == null ? start : end).getSeconds());
                listened = Math.min(listened, 60 * 60 * 24);

                QrCode qr = null;
                if (item.qrCode() != null && !item.qrCode().isBlank()) {
                    qr = qrCodes.findByCode(item.qrCode())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                    "QR code not found: " + item.qrCode()));
                    if (qr.getPoi() != null
                            && !qr.getPoi().getId().equals(item.poiId())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "QR code does not belong to this POI");
                    }
                }
                if (item.triggerType() == TriggerType.QR
                        && (item.qrCode() == null || item.qrCode().isBlank())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "qrCode is required when triggerType=QR");
                }

                Optional<PoiAudio> audio = audios.findByPoiIdAndLanguageCode(item.poiId(), language);
                double duration = audio.map(PoiAudio::getDurationSeconds).orElse(0D);
                // Completion is measured against the known audio length. If the
                // duration is unavailable, fall back to the client's flag.
                boolean completed = duration > 0
                        ? listened >= duration * 0.95
                        : Boolean.TRUE.equals(item.completed());

                PlaybackLog log = new PlaybackLog();
                log.setId(item.id());
                log.setDeviceId(item.deviceId());
                log.setPoiId(item.poiId());
                log.setTriggerType(item.triggerType());
                log.setAudioMode(item.audioMode());
                log.setLanguageCode(language);
                log.setQrCode(qr == null ? null : qr.getCode());
                log.setQrId(qr == null ? null : qr.getId());
                log.setBusStopId(qr == null || qr.getBusStop() == null ? null : qr.getBusStop().getId());
                log.setStartTime(start);
                log.setEndTime(end);
                log.setListenedSeconds(listened);
                log.setCompleted(completed);
                log.setValidListen(listened >= minListen);
                logs.save(log);
                devices.touch(item.deviceId());
                accepted++;
            } catch (ResponseStatusException ex) {
                rejected++;
                if (errors.size() < 50) {
                    errors.add(item.id() + ": " + ex.getReason());
                }
            } catch (Exception ex) {
                rejected++;
                if (errors.size() < 50) {
                    errors.add(item.id() + ": " + ex.getMessage());
                }
            }
        }
        return new PlaybackBatchResponse(accepted, duplicates, rejected, errors);
    }

    @Transactional(readOnly = true)
    public PageResponse<PlaybackLogResponse> search(Long poiId, TriggerType triggerType,
                                                    String languageCode, LocalDateTime from,
                                                    LocalDateTime to, int page, int size) {
        return PageResponse.of(logs.search(poiId, triggerType,
                languageCode == null || languageCode.isBlank() ? null : languageCode,
                from, to,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200),
                        Sort.by(Sort.Direction.DESC, "startTime")))
                .map(this::toResponse));
    }

    public PlaybackLogResponse toResponse(PlaybackLog log) {
        return new PlaybackLogResponse(log.getId(), log.getDeviceId(), log.getPoiId(),
                log.getTriggerType(), log.getAudioMode(), log.getLanguageCode(),
                log.getQrCode(), log.getQrId(), log.getBusStopId(),
                log.getStartTime(), log.getEndTime(), log.getListenedSeconds(),
                log.isCompleted(), log.isValidListen());
    }
}
