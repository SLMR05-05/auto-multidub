package com.travelguide.service;

import com.travelguide.dto.PoiDtos.TranslationRequest;
import com.travelguide.dto.TranslationCsvDtos.ImportError;
import com.travelguide.dto.TranslationCsvDtos.ImportResult;
import com.travelguide.entity.Poi;
import com.travelguide.entity.PoiTranslation;
import com.travelguide.repository.PoiRepository;
import com.travelguide.repository.PoiTranslationRepository;
import com.travelguide.util.LanguageCatalog;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CSV import/export for the 7-language translation matrix (FR-CMS-10).
 */
@Service
public class TranslationCsvService {

    private final PoiRepository pois;
    private final PoiTranslationRepository translations;
    private final PoiService poiService;

    public TranslationCsvService(PoiRepository pois, PoiTranslationRepository translations,
                                 PoiService poiService) {
        this.pois = pois;
        this.translations = translations;
        this.poiService = poiService;
    }

    @Transactional(readOnly = true)
    public String exportCsv() {
        List<Poi> all = pois.findAll();
        List<Long> ids = all.stream().map(Poi::getId).toList();
        Map<Long, Map<String, PoiTranslation>> byPoi = ids.isEmpty()
                ? Map.of()
                : translations.findByPoiIdIn(ids).stream()
                        .collect(Collectors.groupingBy(t -> t.getPoi().getId(),
                                Collectors.toMap(PoiTranslation::getLanguageCode, t -> t, (a, b) -> a)));

        StringBuilder csv = new StringBuilder();
        csv.append("poi_id,poi_code,language,name,description,tts_script\n");
        for (Poi poi : all) {
            Map<String, PoiTranslation> values = byPoi.getOrDefault(poi.getId(), Map.of());
            for (String language : LanguageCatalog.codes()) {
                PoiTranslation translation = values.get(language);
                csv.append(poi.getId()).append(',')
                        .append(csv(poi.getCode())).append(',')
                        .append(language).append(',')
                        .append(csv(translation == null ? "" : translation.getName())).append(',')
                        .append(csv(translation == null ? "" : translation.getDescription())).append(',')
                        .append(csv(translation == null ? "" : translation.getTtsScript()))
                        .append('\n');
            }
        }
        return csv.toString();
    }

    public ImportResult importCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }
        String content;
        try {
            content = new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read CSV file");
        }
        if (content.startsWith("\uFEFF")) {
            content = content.substring(1);
        }

        List<List<String>> rows = parse(content);
        int imported = 0;
        int skipped = 0;
        List<ImportError> errors = new ArrayList<>();

        // Export format starts with poi_id; the compact format starts with poi_code.
        int headerOffset = 0;
        if (!rows.isEmpty() && !rows.get(0).isEmpty()
                && "poi_id".equalsIgnoreCase(rows.get(0).get(0).trim())) {
            headerOffset = 1;
        }

        for (int i = 0; i < rows.size(); i++) {
            List<String> row = rows.get(i);
            int line = i + 1;
            if (row.isEmpty() || row.stream().allMatch(String::isBlank)) {
                continue;
            }
            if (i == 0 && row.get(0).equalsIgnoreCase("poi_id")) {
                continue;
            }
            int offset = headerOffset;
            if (offset == 0 && row.size() >= 6 && row.get(0).trim().matches("\\d+")) {
                // Headerless export row: poi_id,poi_code,language,name,description,tts_script
                offset = 1;
            }
            if (row.size() < offset + 4) {
                skipped++;
                errors.add(new ImportError(line, "Expected at least: poi_code,language,name"));
                continue;
            }
            String poiCode = row.get(offset).trim();
            String language = row.get(offset + 1).trim();
            String name = row.get(offset + 2).trim();
            String description = row.size() > offset + 3 ? row.get(offset + 3) : null;
            String ttsScript = row.size() > offset + 4 ? row.get(offset + 4) : null;

            try {
                if (!LanguageCatalog.supports(language)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Unsupported language: " + language);
                }
                if (name.isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
                }
                Poi poi = pois.findByCode(poiCode)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "POI code not found: " + poiCode));
                poiService.upsertTranslation(poi.getId(), language,
                        new TranslationRequest(name, blankToNull(description), blankToNull(ttsScript)));
                imported++;
            } catch (Exception ex) {
                skipped++;
                errors.add(new ImportError(line, ex.getMessage()));
            }
        }
        return new ImportResult(imported, skipped, errors);
    }

    /** Minimal RFC4180 parser with quoted fields. */
    List<List<String>> parse(String content) {
        List<List<String>> rows = new ArrayList<>();
        List<String> row = new ArrayList<>();
        StringBuilder field = new StringBuilder();
        boolean quoted = false;

        for (int i = 0; i < content.length(); i++) {
            char ch = content.charAt(i);
            if (quoted) {
                if (ch == '"') {
                    if (i + 1 < content.length() && content.charAt(i + 1) == '"') {
                        field.append('"');
                        i++;
                    } else {
                        quoted = false;
                    }
                } else {
                    field.append(ch);
                }
            } else if (ch == '"') {
                quoted = true;
            } else if (ch == ',') {
                row.add(field.toString());
                field.setLength(0);
            } else if (ch == '\n' || ch == '\r') {
                if (ch == '\r' && i + 1 < content.length() && content.charAt(i + 1) == '\n') {
                    i++;
                }
                row.add(field.toString());
                field.setLength(0);
                rows.add(row);
                row = new ArrayList<>();
            } else {
                field.append(ch);
            }
        }
        if (field.length() > 0 || !row.isEmpty()) {
            row.add(field.toString());
            rows.add(row);
        }
        return rows;
    }

    private String csv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
