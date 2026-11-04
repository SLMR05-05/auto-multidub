package com.travelguide.controller;

import com.travelguide.util.LanguageCatalog;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/languages")
public class LanguageController {

    @GetMapping
    public List<LanguageCatalog.Language> all() {
        return LanguageCatalog.all();
    }
}
