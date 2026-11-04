package com.travelguide.service;

import com.travelguide.entity.SystemSetting;
import com.travelguide.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Monotonic global version used by the mobile delta sync (FR-CON-02).
 * Publishing content or changing published content increments it.
 */
@Service
public class DataVersionService {

    private final SystemSettingRepository settings;

    public DataVersionService(SystemSettingRepository settings) {
        this.settings = settings;
    }

    public long current() {
        return settings.findById(SystemSettingService.DATA_VERSION)
                .map(setting -> parse(setting.getValue()))
                .orElse(1L);
    }

    @Transactional
    public synchronized long next() {
        SystemSetting setting = settings.findForUpdate(SystemSettingService.DATA_VERSION)
                .orElseGet(() -> {
                    SystemSetting created = new SystemSetting();
                    created.setKey(SystemSettingService.DATA_VERSION);
                    created.setValue("1");
                    created.setDescription("Global published data version used for delta sync");
                    return created;
                });
        long next = parse(setting.getValue()) + 1;
        setting.setValue(Long.toString(next));
        setting.setUpdatedAt(LocalDateTime.now());
        settings.save(setting);
        return next;
    }

    private long parse(String value) {
        try {
            return Long.parseLong(value.trim());
        } catch (Exception ex) {
            return 1L;
        }
    }
}
