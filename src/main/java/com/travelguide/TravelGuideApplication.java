package com.travelguide;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;

@SpringBootApplication
@EnableScheduling
public class TravelGuideApplication {

    private static final Logger log = LoggerFactory.getLogger(TravelGuideApplication.class);

    public static void main(String[] args) {
        // 1. Release port 8080 if an old zombie instance is holding it
        killOrphanedPortIfBusy(8080);

        // 2. Watchdog: Automatically terminate Spring Boot when Maven / Terminal parent process exits
        initParentProcessWatchdog();

        SpringApplication.run(TravelGuideApplication.class, args);
    }

    /**
     * Monitors the parent process (e.g. Maven 'mvn spring-boot:run', CMD, PowerShell, or Git Bash).
     * If Maven or the launching terminal process is killed or terminated, this child JVM process
     * will immediately terminate itself so that port 8080 is never left running in the background.
     */
    private static void initParentProcessWatchdog() {
        // Skip in cloud production environments (Docker, Render, Heroku)
        if (System.getenv("RENDER") != null || System.getenv("DYNO") != null) {
            return;
        }

        try {
            ProcessHandle current = ProcessHandle.current();
            current.parent().ifPresent(parent -> {
                long parentPid = parent.pid();
                // Ensure valid parent process (not system init / PID 1)
                if (parentPid > 1) {
                    log.info("[Watchdog] Attached to parent process (PID: {}). Spring Boot will auto-terminate when parent stops.", parentPid);
                    parent.onExit().thenRun(() -> {
                        System.err.println("\n[Watchdog] Parent process (PID " + parentPid + ") stopped/killed. Terminating Spring Boot to release port 8080...");
                        System.exit(0);
                    });
                }
            });
        } catch (Throwable t) {
            log.debug("[Watchdog] Unable to register parent exit handler: {}", t.getMessage());
        }
    }

    /**
     * Checks if the specified port is already occupied on local Windows machines.
     * If an orphaned process is holding it, terminates that process so Spring Boot can bind.
     */
    private static void killOrphanedPortIfBusy(int port) {
        String os = System.getProperty("os.name", "").toLowerCase();
        if (!os.contains("win") || System.getenv("RENDER") != null) {
            return;
        }

        try (ServerSocket socket = new ServerSocket(port)) {
            // Port is free, nothing to do
        } catch (Exception e) {
            // Port is currently occupied; find and terminate the occupying process
            try {
                long myPid = ProcessHandle.current().pid();
                Process findProcess = Runtime.getRuntime().exec(new String[]{
                        "cmd.exe", "/c", "netstat -ano | findstr :" + port + " | findstr LISTENING"
                });
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(findProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        String[] parts = line.trim().split("\\s+");
                        if (parts.length >= 5) {
                            String pidStr = parts[parts.length - 1];
                            long pid = Long.parseLong(pidStr);
                            if (pid > 0 && pid != myPid) {
                                System.err.println("[PortManager] Found orphaned process (PID: " + pid + ") holding port " + port + ". Releasing port...");
                                Runtime.getRuntime().exec(new String[]{"taskkill", "/F", "/PID", String.valueOf(pid)}).waitFor();
                                Thread.sleep(500); // Allow OS to release socket
                            }
                        }
                    }
                }
            } catch (Throwable t) {
                log.warn("[PortManager] Could not release port {}: {}", port, t.getMessage());
            }
        }
    }
}
