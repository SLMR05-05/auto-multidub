package com.travelguide.service;

import com.travelguide.dto.AnalyticsDtos.*;
import com.travelguide.dto.QrDtos.ScanStat;
import com.travelguide.entity.LocationPoint;
import com.travelguide.entity.PlaybackLog;
import com.travelguide.entity.Poi;
import com.travelguide.entity.QrCode;
import com.travelguide.entity.TriggerType;
import com.travelguide.repository.LocationPointRepository;
import com.travelguide.repository.PlaybackLogRepository;
import com.travelguide.repository.PoiRepository;
import com.travelguide.repository.QrCodeRepository;
import com.travelguide.repository.TrackingSessionRepository;
import com.travelguide.util.GeoUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final PlaybackLogRepository playbackLogs;
    private final TrackingSessionRepository sessions;
    private final LocationPointRepository locationPoints;
    private final PoiRepository pois;
    private final QrCodeRepository qrCodes;

    public AnalyticsService(PlaybackLogRepository playbackLogs, TrackingSessionRepository sessions,
                            LocationPointRepository locationPoints, PoiRepository pois,
                            QrCodeRepository qrCodes) {
        this.playbackLogs = playbackLogs;
        this.sessions = sessions;
        this.locationPoints = locationPoints;
        this.pois = pois;
        this.qrCodes = qrCodes;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(LocalDate from, LocalDate to) {
        Range range = range(from, to);
        List<PlaybackLog> logs = logs(range);
        List<PlaybackLog> valid = logs.stream().filter(PlaybackLog::isValidListen).toList();

        Map<String, Long> triggers = logs.stream().collect(Collectors.groupingBy(
                log -> log.getTriggerType().name(), LinkedHashMap::new, Collectors.counting()));
        Map<String, Long> languages = logs.stream().collect(Collectors.groupingBy(
                PlaybackLog::getLanguageCode, LinkedHashMap::new, Collectors.counting()));

        long uniqueDevices = logs.stream().map(PlaybackLog::getDeviceId).distinct().count();
        long qrScans = logs.stream().filter(log -> log.getTriggerType() == TriggerType.QR).count();
        long sessionCount = sessions.countByStartedAtBetween(range.fromTime(), range.toTime());

        return new DashboardResponse(range.from(), range.to(), sessionCount,
                logs.size(), valid.size(), qrScans, uniqueDevices, triggers, languages);
    }

    @Transactional(readOnly = true)
    public TopPoisResponse topPois(LocalDate from, LocalDate to, int limit) {
        Range range = range(from, to);
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        List<PlaybackLog> valid = logs(range).stream().filter(PlaybackLog::isValidListen).toList();

        Map<Long, List<PlaybackLog>> byPoi = valid.stream()
                .collect(Collectors.groupingBy(PlaybackLog::getPoiId));
        Map<Long, Poi> poiMap = pois.findAllById(byPoi.keySet()).stream()
                .collect(Collectors.toMap(Poi::getId, poi -> poi));

        List<TopPoiItem> items = byPoi.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue().size(), a.getValue().size()))
                .limit(safeLimit)
                .map(entry -> {
                    List<PlaybackLog> list = entry.getValue();
                    double avg = list.stream().mapToInt(PlaybackLog::getListenedSeconds).average().orElse(0);
                    long completed = list.stream().filter(PlaybackLog::isCompleted).count();
                    Poi poi = poiMap.get(entry.getKey());
                    return new TopPoiItem(entry.getKey(),
                            poi == null ? null : poi.getCode(),
                            poi == null ? "(deleted POI)" : poi.getName(),
                            list.size(), round(avg), round((double) completed / list.size()));
                })
                .toList();
        return new TopPoisResponse(range.from(), range.to(), items);
    }

    @Transactional(readOnly = true)
    public HeatmapResponse heatmap(LocalDate from, LocalDate to, Double cellSize, Integer minDevices) {
        Range range = range(from, to);
        double cell = cellSize == null ? 0.001 : cellSize;
        if (cell < 0.0001 || cell > 0.1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "cellSize must be between 0.0001 and 0.1 degrees");
        }
        // Never allow a caller to lower the privacy floor below five devices.
        int minimum = minDevices == null ? 5 : Math.max(minDevices, 5);

        List<LocationPoint> points = locationPoints
                .findByRecordedAtBetweenOrderBySessionIdAscRecordedAtAsc(range.fromTime(), range.toTime());
        Map<String, List<LocationPoint>> bySession = points.stream()
                .collect(Collectors.groupingBy(LocationPoint::getSessionId, LinkedHashMap::new, Collectors.toList()));

        Map<String, Cell> cells = new HashMap<>();
        for (List<LocationPoint> sessionPoints : bySession.values()) {
            List<LocationPoint> kept = trimPrivacyEdges(sessionPoints, 100.0);
            for (LocationPoint point : kept) {
                int latIndex = (int) Math.floor(point.getLatitude() / cell);
                int lngIndex = (int) Math.floor(point.getLongitude() / cell);
                String key = latIndex + ":" + lngIndex;
                Cell value = cells.computeIfAbsent(key, ignored -> new Cell(
                        (latIndex + 0.5) * cell, (lngIndex + 0.5) * cell));
                value.devices.add(point.getDeviceId());
                value.pointCount++;
            }
        }

        List<HeatmapCell> result = cells.values().stream()
                .filter(cellValue -> cellValue.devices.size() >= minimum)
                .sorted((a, b) -> Long.compare(b.pointCount, a.pointCount))
                .limit(2000)
                .map(cellValue -> new HeatmapCell(round6(cellValue.latitude), round6(cellValue.longitude),
                        cellValue.devices.size(), cellValue.pointCount))
                .toList();
        return new HeatmapResponse(range.from(), range.to(), cell, minimum, result);
    }

    @Transactional(readOnly = true)
    public TransitionResponse transitions(LocalDate from, LocalDate to) {
        Range range = range(from, to);
        List<PlaybackLog> valid = logs(range).stream().filter(PlaybackLog::isValidListen).toList();
        Map<String, List<PlaybackLog>> byDevice = valid.stream()
                .collect(Collectors.groupingBy(PlaybackLog::getDeviceId));

        Map<String, Long> counts = new HashMap<>();
        Map<String, long[]> pairs = new HashMap<>();
        for (List<PlaybackLog> deviceLogs : byDevice.values()) {
            deviceLogs.sort(Comparator.comparing(PlaybackLog::getStartTime));
            for (int i = 1; i < deviceLogs.size(); i++) {
                Long fromPoi = deviceLogs.get(i - 1).getPoiId();
                Long toPoi = deviceLogs.get(i).getPoiId();
                if (!Objects.equals(fromPoi, toPoi)) {
                    String key = fromPoi + ":" + toPoi;
                    counts.merge(key, 1L, Long::sum);
                    pairs.putIfAbsent(key, new long[]{fromPoi, toPoi});
                }
            }
        }

        Set<Long> poiIds = pairs.values().stream()
                .flatMapToLong(pair -> Arrays.stream(pair)).boxed().collect(Collectors.toSet());
        Map<Long, Poi> poiMap = pois.findAllById(poiIds).stream()
                .collect(Collectors.toMap(Poi::getId, poi -> poi));

        List<TransitionItem> items = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(20)
                .map(entry -> {
                    long[] pair = pairs.get(entry.getKey());
                    Poi fromPoi = poiMap.get(pair[0]);
                    Poi toPoi = poiMap.get(pair[1]);
                    return new TransitionItem(pair[0], fromPoi == null ? "(deleted)" : fromPoi.getName(),
                            pair[1], toPoi == null ? "(deleted)" : toPoi.getName(), entry.getValue());
                })
                .toList();
        return new TransitionResponse(range.from(), range.to(), items);
    }

    @Transactional(readOnly = true)
    public List<ScanStat> qrStats(LocalDate from, LocalDate to) {
        Range range = range(from, to);
        Map<Long, Long> counts = logs(range).stream()
                .filter(log -> log.getTriggerType() == TriggerType.QR && log.getQrId() != null)
                .collect(Collectors.groupingBy(PlaybackLog::getQrId, Collectors.counting()));
        Map<Long, QrCode> qrMap = qrCodes.findAllById(counts.keySet()).stream()
                .collect(Collectors.toMap(QrCode::getId, qr -> qr));
        return counts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .map(entry -> {
                    QrCode qr = qrMap.get(entry.getKey());
                    return new ScanStat(entry.getKey(),
                            qr == null ? null : qr.getCode(),
                            qr == null ? null : qr.getLabel(),
                            qr == null || qr.getPoi() == null ? null : qr.getPoi().getId(),
                            qr == null || qr.getBusStop() == null ? null : qr.getBusStop().getId(),
                            entry.getValue());
                })
                .toList();
    }

    /**
     * Aggregated CSV export. Raw device ids and raw points are never included
     * (FR-ANA-11).
     */
    @Transactional(readOnly = true)
    public String exportCsv(LocalDate from, LocalDate to) {
        DashboardResponse dashboard = dashboard(from, to);
        TopPoisResponse top = topPois(from, to, 50);
        StringBuilder csv = new StringBuilder();
        csv.append("metric,value\n");
        csv.append("from,").append(csv(dashboard.from().toString())).append('\n');
        csv.append("to,").append(csv(dashboard.to().toString())).append('\n');
        csv.append("sessions,").append(dashboard.sessions()).append('\n');
        csv.append("total_listens,").append(dashboard.totalListens()).append('\n');
        csv.append("valid_listens,").append(dashboard.validListens()).append('\n');
        csv.append("qr_scans,").append(dashboard.qrScans()).append('\n');
        csv.append("unique_devices,").append(dashboard.uniqueDevices()).append("\n\n");
        csv.append("poi_id,poi_code,poi_name,valid_listens,avg_listened_seconds,completion_rate\n");
        for (TopPoiItem item : top.items()) {
            csv.append(item.poiId()).append(',')
                    .append(csv(item.poiCode())).append(',')
                    .append(csv(item.poiName())).append(',')
                    .append(item.validListens()).append(',')
                    .append(item.avgListenedSeconds()).append(',')
                    .append(item.completionRate()).append('\n');
        }
        return csv.toString();
    }

    private List<PlaybackLog> logs(Range range) {
        return playbackLogs.findByStartTimeBetweenOrderByStartTimeAsc(range.fromTime(), range.toTime());
    }

    private Range range(LocalDate from, LocalDate to) {
        LocalDate end = to == null ? LocalDate.now() : to;
        LocalDate start = from == null ? end.minusDays(29) : from;
        if (start.isAfter(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must be before or equal to to");
        }
        if (ChronoUnit.DAYS.between(start, end) > 366) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date range is limited to 366 days");
        }
        return new Range(start, end, start.atStartOfDay(), end.atTime(LocalTime.MAX));
    }

    /**
     * PRD FR-ANA-04: remove the first and last 100 m of each journey so that
     * home/work locations cannot be inferred.
     */
    List<LocationPoint> trimPrivacyEdges(List<LocationPoint> points, double meters) {
        if (points == null || points.size() < 2) {
            return List.of();
        }
        int startIndex = -1;
        double cumulative = 0;
        for (int i = 1; i < points.size(); i++) {
            cumulative += distance(points.get(i - 1), points.get(i));
            if (cumulative >= meters) {
                startIndex = i;
                break;
            }
        }
        if (startIndex < 0) {
            return List.of();
        }
        int endIndex = -1;
        cumulative = 0;
        for (int i = points.size() - 2; i >= 0; i--) {
            cumulative += distance(points.get(i), points.get(i + 1));
            if (cumulative >= meters) {
                endIndex = i;
                break;
            }
        }
        if (endIndex < 0 || startIndex > endIndex) {
            return List.of();
        }
        return points.subList(startIndex, endIndex + 1);
    }

    private double distance(LocationPoint a, LocationPoint b) {
        return GeoUtils.distanceMeters(a.getLatitude(), a.getLongitude(), b.getLatitude(), b.getLongitude());
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private double round6(double value) {
        return Math.round(value * 1_000_000.0) / 1_000_000.0;
    }

    private String csv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private record Range(LocalDate from, LocalDate to, java.time.LocalDateTime fromTime,
                         java.time.LocalDateTime toTime) {
    }

    private static final class Cell {
        private final double latitude;
        private final double longitude;
        private final Set<String> devices = new HashSet<>();
        private long pointCount;

        private Cell(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }
}
