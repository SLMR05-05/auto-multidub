package com.travelguide.service;

import com.travelguide.entity.SystemSetting;
import com.travelguide.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SystemSettingService {

    public static final String DATA_VERSION = "data_version";
    public static final String DEBOUNCE_SECONDS = "debounce_seconds";
    public static final String HYSTERESIS_FACTOR = "hysteresis_factor";
    public static final String COOLDOWN_MINUTES = "cooldown_minutes";
    public static final String GPS_ACCURACY_THRESHOLD_METERS = "gps_accuracy_threshold_m";
    public static final String GPS_JUMP_SPEED_KMH = "gps_jump_speed_kmh";
    public static final String AUDIO_QUEUE_CAPACITY = "audio_queue_capacity";
    public static final String AUDIO_QUEUE_TTL_SECONDS = "audio_queue_ttl_seconds";
    public static final String MIN_VALID_LISTEN_SECONDS = "min_valid_listen_seconds";
    public static final String LOCATION_INTERVAL_MOVING_SECONDS = "location_interval_moving_seconds";
    public static final String LOCATION_INTERVAL_STATIONARY_SECONDS = "location_interval_stationary_seconds";
    public static final String RAW_LOCATION_RETENTION_DAYS = "raw_location_retention_days";
    public static final String PLAYBACK_LOG_RETENTION_MONTHS = "playback_log_retention_months";
    public static final String APPROACH_MARGIN_METERS = "approach_margin_m";
    public static final String DEFAULT_LANGUAGE = "default_language";

    private static final Map<String, String> DEFAULTS = new LinkedHashMap<>();
    private static final Map<String, String> DESCRIPTIONS = new LinkedHashMap<>();

    static {
        defaults(DATA_VERSION, "1", "Global published data version used for delta sync");
        defaults(DEBOUNCE_SECONDS, "3", "PRD P2 - seconds inside geofence before ENTER");
        defaults(HYSTERESIS_FACTOR, "1.2", "PRD P3 - leave radius multiplication factor");
        defaults(COOLDOWN_MINUTES, "30", "PRD P4 - automatic replay cooldown per POI");
        defaults(GPS_ACCURACY_THRESHOLD_METERS, "50", "PRD P5 - discard GPS samples above this accuracy");
        defaults(GPS_JUMP_SPEED_KMH, "120", "Discard impossible GPS jumps above this speed");
        defaults(AUDIO_QUEUE_CAPACITY, "3", "PRD P6 - audio queue capacity");
        defaults(AUDIO_QUEUE_TTL_SECONDS, "60", "PRD P7 - queued item time-to-live");
        defaults(MIN_VALID_LISTEN_SECONDS, "5", "PRD P8 - minimum listened seconds for a valid play");
        defaults(LOCATION_INTERVAL_MOVING_SECONDS, "10", "PRD P9 - tracking interval while moving");
        defaults(LOCATION_INTERVAL_STATIONARY_SECONDS, "60", "PRD P9 - tracking interval while stationary");
        defaults(RAW_LOCATION_RETENTION_DAYS, "90", "PRD P10 - raw location retention");
        defaults(PLAYBACK_LOG_RETENTION_MONTHS, "12", "Playback log retention per technical decision 13");
        defaults(APPROACH_MARGIN_METERS, "30", "FR-GEO-09 - approach geofence margin");
        defaults(DEFAULT_LANGUAGE, "vi", "Base language; cannot be disabled");
    }

    private static void defaults(String key, String value, String description) {
        DEFAULTS.put(key, value);
        DESCRIPTIONS.put(key, description);
    }

    private final SystemSettingRepository settings;

    public SystemSettingService(SystemSettingRepository settings) {
        this.settings = settings;
    }

    @Transactional
    public void seedDefaults() {
        for (Map.Entry<String, String> entry : DEFAULTS.entrySet()) {
            if (settings.findById(entry.getKey()).isEmpty()) {
                SystemSetting setting = new SystemSetting();
                setting.setKey(entry.getKey());
                setting.setValue(entry.getValue());
                setting.setDescription(DESCRIPTIONS.get(entry.getKey()));
                settings.save(setting);
            }
        }
    }

    public String get(String key) {
        return settings.findById(key)
                .map(SystemSetting::getValue)
                .orElseGet(() -> DEFAULTS.get(key));
    }

    public long getLong(String key) {
        String value = get(key);
        return value == null ? 0L : Long.parseLong(value.trim());
    }

    public int getInt(String key) {
        return (int) getLong(key);
    }

    public double getDouble(String key) {
        String value = get(key);
        return value == null ? 0D : Double.parseDouble(value.trim());
    }

    public boolean getBoolean(String key) {
        return Boolean.parseBoolean(get(key));
    }

    public Map<String, String> all() {
        Map<String, String> result = new LinkedHashMap<>(DEFAULTS);
        for (SystemSetting setting : settings.findAll()) {
            result.put(setting.getKey(), setting.getValue());
        }
        return result;
    }

    @Transactional
    public void update(String key, String value) {
        SystemSetting setting = settings.findById(key).orElseGet(() -> {
            SystemSetting created = new SystemSetting();
            created.setKey(key);
            return created;
        });
        setting.setValue(value);
        setting.setUpdatedAt(LocalDateTime.now());
        settings.save(setting);
    }
}
