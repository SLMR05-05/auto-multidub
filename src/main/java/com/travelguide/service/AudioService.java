
package com.travelguide.service;

import com.travelguide.dto.ApiDtos.AudioResponse;
import com.travelguide.entity.Audio;
import com.travelguide.entity.Translation;
import com.travelguide.repository.AudioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class AudioService {

    private final AudioRepository audios;
    private final TranslationService translations;
    private final Path audioDirectory;
    private final String pythonCommand;
    private final String piperModel;

    public AudioService(
            AudioRepository audios,
            TranslationService translations,
            @Value("${app.audio-directory:./storage/audio}") String directory,
            @Value("${app.tts.python-command:python}") String pythonCommand,
            @Value("${app.tts.piper-model:vi_VN-vais1000-medium}") String piperModel
    ) {
        this.audios = audios;
        this.translations = translations;
        this.audioDirectory = Paths.get(directory).toAbsolutePath().normalize();
        this.pythonCommand = pythonCommand;
        this.piperModel = piperModel;
    }

    public AudioResponse synthesize(Long translationId, String voiceName) {

        Translation translation = translations.findById(translationId);

        String text = translation.getTranslatedText();

        if (text == null || text.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Translation text is empty"
            );
        }

        String filename = UUID.randomUUID() + ".wav";

        Path audioFile = audioDirectory.resolve(filename).normalize();
        Path logFile = audioDirectory.resolve(UUID.randomUUID() + ".log").normalize();

        try {
            Files.createDirectories(audioDirectory);

            if (!audioFile.startsWith(audioDirectory)) {
                throw new IllegalStateException("Invalid audio path");
            }

            // Chạy Piper bằng Python
            ProcessBuilder processBuilder = new ProcessBuilder(
                    pythonCommand,
                    "-m",
                    "piper",
                    "--model",
                    piperModel,
                    "--output_file",
                    audioFile.toString()
            );

            // Ghi log lỗi của Piper ra file
            processBuilder.redirectErrorStream(true);
            processBuilder.redirectOutput(logFile.toFile());

            Process process = processBuilder.start();

            // Gửi nội dung cần đọc cho Piper
            try (var input = process.getOutputStream()) {
                input.write(text.getBytes(StandardCharsets.UTF_8));
                input.write('\n');
            }

            // Chờ Piper xử lý tối đa 120 giây
            boolean finished = process.waitFor(120, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();

                throw new IOException("Piper processing timeout");
            }

            String log = "";

            if (Files.exists(logFile)) {
                log = Files.readString(logFile, StandardCharsets.UTF_8);
                Files.deleteIfExists(logFile);
            }

            if (process.exitValue() != 0) {
                throw new IOException("Piper failed: " + log);
            }

            // Kiểm tra file WAV đã được tạo
            if (!Files.exists(audioFile) || Files.size(audioFile) <= 44) {
                throw new IOException("Piper did not create a valid WAV file");
            }

            // Lưu thông tin âm thanh vào database
            Audio audio = new Audio();

            audio.setTranslationId(translationId);
            audio.setLanguageCode(translation.getTargetLanguage());
            audio.setFileName(filename);
            audio.setFilePath(audioFile.toString());

            audio = audios.save(audio);

            return new AudioResponse(
                    audio.getId(),
                    translationId,
                    audio.getLanguageCode(),
                    "wav",
                    "/api/v1/audio/" + audio.getId() + "/stream"
            );

        } catch (InterruptedException ex) {

            Thread.currentThread().interrupt();

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Piper processing was interrupted"
            );

        } catch (Exception ex) {

            try {
                Files.deleteIfExists(logFile);
            } catch (IOException ignored) {
            }

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Piper Text-to-Speech failed: " + ex.getMessage()
            );
        }
    }

    public Audio getAudio(Long id) {

        return audios.findById(id).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Audio not found"
                )
        );
    }
}
