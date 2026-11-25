package com.travelguide.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Durable database queue; each build runs outside the publication request. */
@Component
@EnableScheduling
@ConditionalOnProperty(name = "app.offline-packages.worker-enabled", havingValue = "true", matchIfMissing = true)
public class OfflinePackageWorker {
    private static final Logger log = LoggerFactory.getLogger(OfflinePackageWorker.class);
    private final OfflinePackageService packages;

    public OfflinePackageWorker(OfflinePackageService packages) {
        this.packages = packages;
    }

    @Scheduled(fixedDelayString = "${app.offline-packages.build-delay-ms:2000}",
            initialDelayString = "${app.offline-packages.build-delay-ms:2000}")
    public void buildPending() {
        for (Long id : packages.pendingBuilds()) {
            try {
                packages.buildPending(id);
            } catch (Exception ex) {
                log.error("Offline package {} failed", id, ex);
                packages.failBuild(id, ex.getMessage());
            }
        }
    }
}
