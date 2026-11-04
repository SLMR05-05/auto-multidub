package com.travelguide.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CodeUtilsTest {

    @Test
    void randomBase62HasRequestedLengthAndAlphabet() {
        String code = CodeUtils.randomBase62(10);
        assertEquals(10, code.length());
        assertTrue(code.chars().allMatch(c -> CodeUtils.BASE62.indexOf(c) >= 0));
    }

    @Test
    void rejectsShortCodes() {
        assertThrows(IllegalArgumentException.class, () -> CodeUtils.randomBase62(7));
    }

    @Test
    void slugifiesVietnamese() {
        assertEquals("phuong-khanh-hoi", CodeUtils.slugify("Phường Khánh Hội"));
        assertEquals("ben-nha-rong", CodeUtils.slugify("Bến Nhà Rồng"));
    }
}
