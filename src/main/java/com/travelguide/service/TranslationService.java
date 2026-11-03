
package com.travelguide.service;

import com.travelguide.dto.ApiDtos.*;
import com.travelguide.entity.History;
import com.travelguide.entity.Translation;
import com.travelguide.repository.HistoryRepository;
import com.travelguide.repository.TranslationRepository;
import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TranslationService {

    private final RestClient libreTranslate;
    private final TranslationRepository translations;
    private final HistoryRepository histories;

    public TranslationService(
            RestClient libreTranslateRestClient,
            TranslationRepository translations,
            HistoryRepository histories) {

        this.libreTranslate = libreTranslateRestClient;
        this.translations = translations;
        this.histories = histories;
    }

    public TranslationResponse translate(TranslationRequest request, Long userId) {

        try {
            // Chuẩn bị dữ liệu gửi đến LibreTranslate
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();

            body.add("q", request.text());

            String sourceLanguage = request.sourceLanguage();

            if (sourceLanguage == null || sourceLanguage.isBlank()) {
                sourceLanguage = "auto";
            }

            body.add("source", sourceLanguage);
            body.add("target", request.targetLanguage());
            body.add("format", "text");

            // Gọi LibreTranslate
            JsonNode response = libreTranslate.post()
                    .uri("/translate")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.has("translatedText")) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "LibreTranslate returned an invalid response"
                );
            }

            String translated = response.get("translatedText").asText();

            // Nếu người dùng chọn tự nhận diện ngôn ngữ
            // thì lấy ngôn ngữ thực tế từ kết quả LibreTranslate
            String actualSourceLanguage = sourceLanguage;

            if ("auto".equalsIgnoreCase(sourceLanguage)
                    && response.has("detectedLanguage")
                    && response.get("detectedLanguage").has("language")) {

                actualSourceLanguage =
                        response.get("detectedLanguage").get("language").asText();
            }

            // Lưu bản dịch vào database
            Translation item = new Translation();

            item.setUserId(userId);
            item.setGuideId(request.guideId());
            item.setSourceLanguage(actualSourceLanguage);
            item.setTargetLanguage(request.targetLanguage());
            item.setOriginalText(request.text());
            item.setTranslatedText(translated);

            item = translations.save(item);

            // Lưu lịch sử dịch
            History history = new History();

            history.setUserId(userId);
            history.setAction("TRANSLATE");
            history.setReferenceId(item.getId());
            history.setDetail(
                    actualSourceLanguage + " -> " + request.targetLanguage()
            );

            histories.save(history);

            // Trả kết quả
            return new TranslationResponse(
                    item.getId(),
                    item.getOriginalText(),
                    item.getTranslatedText(),
                    item.getSourceLanguage(),
                    item.getTargetLanguage(),
                    item.getProvider()
            );

        } catch (ResponseStatusException ex) {

            throw ex;

        } catch (Exception ex) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "LibreTranslate failed: " + ex.getMessage()
            );
        }
    }

    public Translation findById(Long id) {

        return translations.findById(id).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Translation not found"
                )
        );
    }
}
