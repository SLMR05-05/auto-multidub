package com.travelguide.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Loads a local .env file (KEY=VALUE) into the Spring Environment with HIGHEST_PRECEDENCE
 * so that all placeholders in application.yml (${VAR_NAME}) resolve directly from .env.
 * Real environment variables and JVM system properties (-D) always take precedence over .env.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public int getOrder() {
        // Runs before ConfigDataEnvironmentPostProcessor (HIGHEST_PRECEDENCE + 10)
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        File file = findEnvFile();
        if (file == null || !file.isFile()) {
            return;
        }

        Map<String, Object> values = new LinkedHashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int separator = trimmed.indexOf('=');
                if (separator <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();
                if (key.isEmpty()) {
                    continue;
                }
                // Strip surrounding single or double quotes
                if (value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                // Allow OS environment variables and JVM -D properties to override .env
                if (System.getenv(key) != null || System.getProperty(key) != null) {
                    continue;
                }
                values.put(key, value);
            }
        } catch (Exception ignored) {
            // .env is optional; ignore parse errors.
        }

        if (!values.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", values));
            values.forEach((key, value) -> System.setProperty(key, String.valueOf(value)));
            System.out.println("[Dotenv] Loaded " + values.size() + " properties from: " + file.getAbsolutePath());
        }
    }

    private File findEnvFile() {
        // 1. Current working directory
        File current = new File(".env");
        if (current.isFile()) {
            return current.getAbsoluteFile();
        }

        // 2. Fall back to user.dir property
        String userDir = System.getProperty("user.dir");
        if (userDir != null) {
            File candidate = new File(userDir, ".env");
            if (candidate.isFile()) {
                return candidate.getAbsoluteFile();
            }
        }

        // 3. Search up parent directories (up to 3 levels)
        File dir = new File(".").getAbsoluteFile();
        for (int i = 0; i < 3 && dir != null; i++) {
            File candidate = new File(dir, ".env");
            if (candidate.isFile()) {
                return candidate.getAbsoluteFile();
            }
            dir = dir.getParentFile();
        }

        return null;
    }
}
