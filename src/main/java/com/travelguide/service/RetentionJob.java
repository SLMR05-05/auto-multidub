package com.travelguide.service;

import com.travelguide.repository.LocationPointRepository;
import com.travelguide.repository.PlaybackLogRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * PRD P10 / decision 13: raw locations are deleted after 90 days and playback
 * logs after 12 months. Aggregated reports are produced on demand from the
 * remaining data and never expose raw device trails.
 */
@Service
public class RetentionJob {

    private final LocationPointRepository points;
    private final PlaybackLogRepository playbackLogs;
    private final SystemSettingService settings;

    public RetentionJob(LocationPointRepository points, PlaybackLogRepository playbackLogs,
                        SystemSettingService settings) {
        this.points = points;
        this.playbackLogs = playbackLogs;
        this.settings = settings;
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime pointCutoff = now.minusDays(
                Math.max(1, settings.getInt(SystemSettingService.RAW_LOCATION_RETENTION_DAYS)));
        LocalDateTime logCutoff = now.minusMonths(
                Math.max(1, settings.getInt(SystemSettingService.PLAYBACK_LOG_RETENTION_MONTHS)));

        long deletedPoints = points.deleteByRecordedAtBefore(pointCutoff);
        long deletedLogs = playbackLogs.deleteByStartTimeBefore(logCutoff);
        System.out.printf("Retention job: deleted %d location points and %d playback logs%n",
                deletedPoints, deletedLogs);
    }
}
