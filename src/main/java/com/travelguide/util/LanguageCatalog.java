package com.travelguide.util;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** The seven official PRD languages (section 22). */
public final class LanguageCatalog {

    public record Language(String code, String name, String nativeName, String ttsLocale) {
    }

    private static final List<Language> LANGUAGES = List.of(
            new Language("vi", "Vietnamese", "Tiếng Việt", "vi-VN"),
            new Language("en", "English", "English", "en-US"),
            new Language("zh-CN", "Chinese (Simplified)", "简体中文", "zh-CN"),
            new Language("th", "Thai", "ไทย", "th-TH"),
            new Language("hi", "Hindi", "हिन्दी", "hi-IN"),
            new Language("ko", "Korean", "한국어", "ko-KR"),
            new Language("ja", "Japanese", "日本語", "ja-JP")
    );

    private LanguageCatalog() {
    }

    public static List<Language> all() {
        return LANGUAGES;
    }

    public static List<String> codes() {
        return LANGUAGES.stream().map(Language::code).toList();
    }

    public static boolean supports(String code) {
        if (code == null) return false;
        return LANGUAGES.stream().anyMatch(l -> l.code().equalsIgnoreCase(code));
    }

    public static String normalize(String code) {
        if (code == null) return null;
        return LANGUAGES.stream()
                .map(Language::code)
                .filter(c -> c.equalsIgnoreCase(code))
                .findFirst()
                .orElse(code);
    }

    public static Map<String, String> asMap() {
        Map<String, String> result = new LinkedHashMap<>();
        for (Language language : LANGUAGES) {
            result.put(language.code(), language.nativeName());
        }
        return result;
    }
}
