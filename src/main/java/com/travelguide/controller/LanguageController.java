package com.travelguide.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/languages")
public class LanguageController {
    @GetMapping
    public List<Map<String, String>> all() {
        return List.of(
            Map.of("code","vi","name","Vietnamese"),
            Map.of("code","en","name","English"),
            Map.of("code","ja","name","Japanese"),
            Map.of("code","ko","name","Korean"),
            Map.of("code","zh-CN","name","Chinese (Simplified)"),
            Map.of("code","fr","name","French"),
            Map.of("code","de","name","German"),
            Map.of("code","es","name","Spanish")
        );
    }
}
