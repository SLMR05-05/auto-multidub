package com.travelguide.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Loads a local .env file (KEY=VALUE) into the Spring Environment without
 * requiring the user to export variables manually. Real environment variables
 * and JVM system properties always take precedence over values from .env.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

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
                // Strip a single pair of surrounding quotes.
                if (value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                // Do not override real environment variables / system properties.
                if (System.getenv(key) != null || System.getProperty(key) != null) {
                    continue;
                }
                if (environment.getProperty(key) == null) {
                    values.put(key, value);
                }
            }
        } catch (Exception ignored) {
            // .env is optional; ignore parse errors.
        }

        if (!values.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", values));
            values.forEach((key, value) -> System.setProperty(key, String.valueOf(value)));
        }
    }

    private File findEnvFile() {
        // Prefer the current working directory (project root when running mvn).
        File current = new File(".env");
        if (current.isFile()) {
            return current;
        }
        // Fall back to the directory of the jar / classpath root.
        String userDir = System.getProperty("user.dir");
        if (userDir != null) {
            File candidate = new File(userDir, ".env");
            if (candidate.isFile()) {
                return candidate;
            }
        }
        return null;
    }
}