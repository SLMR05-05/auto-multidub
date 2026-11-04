package com.travelguide.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TranslationCsvServiceTest {

    private final TranslationCsvService service = new TranslationCsvService(null, null, null);

    @Test
    void parsesQuotedCommasAndEscapedQuotes() {
        List<List<String>> rows = service.parse(
                "poi_code,language,name,description\n"
                        + "ben-nha-rong,vi,\"Bến Nhà Rồng\",\"Một, hai \"\"trích dẫn\"\"\"\n");

        assertEquals(2, rows.size());
        assertEquals("ben-nha-rong", rows.get(1).get(0));
        assertEquals("Bến Nhà Rồng", rows.get(1).get(2));
        assertEquals("Một, hai \"trích dẫn\"", rows.get(1).get(3));
    }

    @Test
    void parsesCrLfAndTrailingNewline() {
        List<List<String>> rows = service.parse("a,b\r\nc,d\r\n");
        assertEquals(2, rows.size());
        assertEquals(List.of("c", "d"), rows.get(1));
    }
}
