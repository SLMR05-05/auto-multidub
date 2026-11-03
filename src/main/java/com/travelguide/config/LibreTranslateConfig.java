package com.travelguide.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class LibreTranslateConfig {

    @Bean
    public RestClient libreTranslateRestClient(
            RestClient.Builder builder,
            @Value("${libretranslate.base-url:http://127.0.0.1:5001}") String baseUrl) {

        return builder
                .baseUrl(baseUrl)
                .build();
    }
}