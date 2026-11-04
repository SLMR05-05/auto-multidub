package com.travelguide.dto;

import java.util.List;

public class TranslationCsvDtos {

    public record ImportError(int line, String message) {
    }

    public record ImportResult(int imported, int skipped, List<ImportError> errors) {
    }
}
