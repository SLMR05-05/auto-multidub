package com.travelguide.controller;

import com.travelguide.dto.TranslationCsvDtos.ImportResult;
import com.travelguide.service.TranslationCsvService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/admin/translations")
@PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
public class AdminTranslationController {

    private final TranslationCsvService csv;

    public AdminTranslationController(TranslationCsvService csv) {
        this.csv = csv;
    }

    @GetMapping("/export.csv")
    public ResponseEntity<byte[]> export() {
        byte[] body = csv.exportCsv().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"translations.csv\"")
                .body(body);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportResult importCsv(@RequestParam("file") MultipartFile file) {
        return csv.importCsv(file);
    }
}
