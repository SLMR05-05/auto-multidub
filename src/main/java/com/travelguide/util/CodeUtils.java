package com.travelguide.util;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class CodeUtils {

    public static final String BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]+");

    private CodeUtils() {
    }

    /** Cryptographically strong Base62 code, at least 8 characters (PRD FR-QR-01). */
    public static String randomBase62(int length) {
        if (length < 8) {
            throw new IllegalArgumentException("QR code length must be at least 8");
        }
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(BASE62.charAt(RANDOM.nextInt(BASE62.length())));
        }
        return sb.toString();
    }

    /** Convert Vietnamese/Unicode text into an ASCII slug. */
    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "poi";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        normalized = DIACRITICS.matcher(normalized).replaceAll("");
        normalized = normalized.replace('đ', 'd').replace('Đ', 'D');
        normalized = NON_ALNUM.matcher(normalized.toLowerCase(Locale.ROOT)).replaceAll("-");
        normalized = normalized.replaceAll("^-+|-+$", "");
        if (normalized.isBlank()) {
            normalized = "poi";
        }
        return normalized.length() > 70 ? normalized.substring(0, 70) : normalized;
    }
}
