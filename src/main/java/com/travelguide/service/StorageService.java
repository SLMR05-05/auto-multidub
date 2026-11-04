package com.travelguide.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class StorageService {

    private final Path audioDirectory;
    private final Path imageDirectory;
    private final Path packageDirectory;

    public StorageService(
            @Value("${app.storage.audio-dir:./storage/audio}") String audioDir,
            @Value("${app.storage.image-dir:./storage/images}") String imageDir,
            @Value("${app.storage.package-dir:./storage/packages}") String packageDir) {
        this.audioDirectory = Path.of(audioDir).toAbsolutePath().normalize();
        this.imageDirectory = Path.of(imageDir).toAbsolutePath().normalize();
        this.packageDirectory = Path.of(packageDir).toAbsolutePath().normalize();
    }

    public Path audioDirectory() {
        return audioDirectory;
    }

    public Path imageDirectory() {
        return imageDirectory;
    }

    public Path packageDirectory() {
        return packageDirectory;
    }

    public Path store(MultipartFile file, Path directory, String extension) {
        try {
            Files.createDirectories(directory);
            String safeExtension = extension.startsWith(".") ? extension : "." + extension;
            Path target = directory.resolve(UUID.randomUUID() + safeExtension.toLowerCase(Locale.ROOT)).normalize();
            if (!target.startsWith(directory)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid storage path");
            }
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return target;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot store file: " + ex.getMessage());
        }
    }

    public Path storeBytes(byte[] data, Path directory, String fileName) {
        try {
            Files.createDirectories(directory);
            Path target = directory.resolve(fileName).normalize();
            if (!target.startsWith(directory)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid storage path");
            }
            Files.write(target, data);
            return target;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot store file: " + ex.getMessage());
        }
    }

    public Path resolve(String filePath) {
        return Path.of(filePath).toAbsolutePath().normalize();
    }

    public void deleteQuietly(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(Path.of(filePath));
        } catch (IOException ignored) {
            // A missing file must never block a content operation.
        }
    }

    public static String extensionOf(String originalName, String fallback) {
        if (originalName == null) {
            return fallback;
        }
        int dot = originalName.lastIndexOf('.');
        if (dot < 0 || dot == originalName.length() - 1) {
            return fallback;
        }
        String extension = originalName.substring(dot + 1).toLowerCase(Locale.ROOT);
        return extension.matches("[a-z0-9]{1,8}") ? extension : fallback;
    }
}
