package com.travelguide;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiFlowTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void fullContentToAnalyticsFlow() throws Exception {
        String token = login();
        long wardId = firstWard(token);

        MvcResult created = mvc.perform(post("/api/v1/admin/pois")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Bến Nhà Rồng",
                                  "wardId": %d,
                                  "latitude": 10.7681,
                                  "longitude": 106.7065,
                                  "radiusMeters": 50,
                                  "priority": 5,
                                  "cooldownMinutes": 20
                                }
                                """.formatted(wardId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();
        long poiId = json(created).get("id").asLong();

        mvc.perform(put("/api/v1/admin/pois/" + poiId + "/translations/vi")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Bến Nhà Rồng",
                                  "description": "Di tích lịch sử bên sông Sài Gòn.",
                                  "ttsScript": "Chào mừng bạn đến với Bến Nhà Rồng."
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complete").value(true));

        mvc.perform(post("/api/v1/admin/pois/" + poiId + "/publish")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publishedCount").value(1))
                .andExpect(jsonPath("$.issues.length()").value(0));

        // Default-language detail
        mvc.perform(get("/api/v1/app/pois/" + poiId).param("lang", "vi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.name").value("Bến Nhà Rồng"))
                .andExpect(jsonPath("$.summary.missingTranslation").value(false));

        // Fallback: Japanese is missing, so English -> Vietnamese is used
        mvc.perform(get("/api/v1/app/pois/" + poiId).param("lang", "ja"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.missingTranslation").value(true))
                .andExpect(jsonPath("$.fallbackLabel").value("Chưa có bản dịch"));

        // Offline delta sync
        MvcResult sync = mvc.perform(get("/api/v1/app/sync")
                        .param("sinceVersion", "0")
                        .param("lang", "vi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pois.length()").value(1))
                .andExpect(jsonPath("$.pois[0].localizedName").value("Bến Nhà Rồng"))
                .andExpect(jsonPath("$.config.dataVersion").isNumber())
                .andReturn();
        long dataVersion = json(sync).get("dataVersion").asLong();

        // Geofence priority/distance check
        mvc.perform(get("/api/v1/app/geofence")
                        .param("lat", "10.7681")
                        .param("lng", "106.7065")
                        .param("lang", "vi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inside[0].poiId").value(poiId))
                .andExpect(jsonPath("$.inside[0].priority").value(5));

        // QR code creation + public resolve
        MvcResult qr = mvc.perform(post("/api/v1/admin/qr-codes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"poiId\":%d,\"label\":\"Trạm Bến Nhà Rồng\"}".formatted(poiId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").isString())
                .andReturn();
        String qrCode = json(qr).get("code").asText();
        long qrId = json(qr).get("id").asLong();
        assertEquals(10, qrCode.length());

        // Print layout accesses the QR's POI/bus-stop associations outside the
        // service transaction, so this also guards against lazy-loading errors.
        mvc.perform(get("/api/v1/admin/qr-codes/" + qrId + "/print")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG));

        mvc.perform(get("/q/" + qrCode).param("lang", "vi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.poiId").value(poiId))
                .andExpect(jsonPath("$.poi.summary.name").value("Bến Nhà Rồng"));

        // Anonymous playback log (idempotent UUID)
        String logId = UUID.randomUUID().toString();
        String deviceId = UUID.randomUUID().toString();
        String body = """
                {
                  "logs": [{
                    "id": "%s",
                    "deviceId": "%s",
                    "poiId": %d,
                    "triggerType": "QR",
                    "audioMode": "TTS",
                    "languageCode": "vi",
                    "qrCode": "%s",
                    "startTime": "%s",
                    "endTime": "%s",
                    "listenedSeconds": 12,
                    "completed": false
                  }]
                }
                """.formatted(logId, deviceId, poiId, qrCode,
                LocalDateTime.now().minusSeconds(12), LocalDateTime.now());

        mvc.perform(post("/api/v1/app/playback-logs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted").value(1))
                .andExpect(jsonPath("$.rejected").value(0));

        // Duplicate must be ignored
        mvc.perform(post("/api/v1/app/playback-logs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duplicates").value(1));

        mvc.perform(get("/api/v1/admin/analytics/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.validListens").value(1))
                .andExpect(jsonPath("$.qrScans").value(1));

        // Delta sync with the current version returns no changed POIs.
        mvc.perform(get("/api/v1/app/sync")
                        .param("sinceVersion", Long.toString(dataVersion))
                        .param("lang", "vi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pois.length()").value(0));
    }

    @Test
    void translationCsvRoundTrip() throws Exception {
        String token = login();
        long wardId = firstWard(token);
        String code = "csv-test-" + UUID.randomUUID().toString().substring(0, 8);

        mvc.perform(post("/api/v1/admin/pois")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "%s",
                                  "name": "CSV Test POI",
                                  "wardId": %d,
                                  "latitude": 10.7600,
                                  "longitude": 106.7000,
                                  "radiusMeters": 50,
                                  "priority": 3
                                }
                                """.formatted(code, wardId)))
                .andExpect(status().isOk());

        MvcResult export = mvc.perform(get("/api/v1/admin/translations/export.csv")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        String exported = export.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertTrue(exported.contains("poi_id,poi_code,language,name,description,tts_script"));
        assertTrue(exported.contains(code + ",en,"));

        String csv = """
                poi_id,poi_code,language,name,description,tts_script
                999999,%s,en,CSV English Name,English description,English TTS
                """.formatted(code);
        MockMultipartFile file = new MockMultipartFile("file", "translations.csv",
                "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        mvc.perform(multipart("/api/v1/admin/translations/import")
                        .file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imported").value(1))
                .andExpect(jsonPath("$.skipped").value(0));

        // Resolve the created POI by code through the admin list, then verify English.
        MvcResult list = mvc.perform(get("/api/v1/admin/pois")
                        .param("search", code)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        long poiId = json(list).get("content").get(0).get("id").asLong();
        mvc.perform(get("/api/v1/admin/pois/" + poiId + "/translations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].languageCode").value("en"))
                .andExpect(jsonPath("$[0].name").value("CSV English Name"));
    }

    @Test
    void trackingConsentAndDeviceDeletion() throws Exception {
        String deviceId = UUID.randomUUID().toString();
        String sessionId = UUID.randomUUID().toString();

        // Tracking is opt-in: a new device starts with consent disabled.
        mvc.perform(post("/api/v1/app/tracking/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"%s\",\"deviceId\":\"%s\"}"
                                .formatted(sessionId, deviceId)))
                .andExpect(status().isForbidden());

        mvc.perform(put("/api/v1/app/devices/" + deviceId + "/consent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"analyticsConsent\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.analyticsConsent").value(true));

        mvc.perform(post("/api/v1/app/tracking/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"%s\",\"deviceId\":\"%s\"}"
                                .formatted(sessionId, deviceId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.acceptedPoints").value(0));

        LocalDateTime start = LocalDateTime.now().minusMinutes(1);
        mvc.perform(post("/api/v1/app/tracking/sessions/" + sessionId + "/points")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"points":[
                                  {"latitude":10.0000,"longitude":106.0,"accuracy":5.0,"recordedAt":"%s"},
                                  {"latitude":10.0010,"longitude":106.0,"accuracy":5.0,"recordedAt":"%s"},
                                  {"latitude":10.0020,"longitude":106.0,"accuracy":5.0,"recordedAt":"%s"},
                                  {"latitude":10.0030,"longitude":106.0,"accuracy":5.0,"recordedAt":"%s"}
                                ]}
                                """.formatted(start, start.plusSeconds(10), start.plusSeconds(20),
                                start.plusSeconds(30))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.acceptedPoints").value(4));

        mvc.perform(post("/api/v1/app/tracking/sessions/" + sessionId + "/end")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.endedAt").exists());

        // Even if the caller asks for minDevices=1, the server must keep the
        // PRD privacy floor of five devices per heatmap cell.
        String token = login();
        mvc.perform(get("/api/v1/admin/analytics/heatmap")
                        .header("Authorization", "Bearer " + token)
                        .param("minDevices", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minDevices").value(5))
                .andExpect(jsonPath("$.cells.length()").value(0));

        mvc.perform(delete("/api/v1/app/devices/" + deviceId + "/data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.locationPointsDeleted").value(4))
                .andExpect(jsonPath("$.trackingSessionsDeleted").value(1));

        mvc.perform(get("/api/v1/app/devices/" + deviceId))
                .andExpect(status().isNotFound());
    }

    private String login() throws Exception {
        MvcResult result = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@test.local\",\"password\":\"Admin123!\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return json(result).get("token").asText();
    }

    private long firstWard(String token) throws Exception {
        MvcResult result = mvc.perform(get("/api/v1/admin/wards")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andReturn();
        return json(result).get(0).get("id").asLong();
    }

    private JsonNode json(MvcResult result) throws Exception {
        return mapper.readTree(result.getResponse().getContentAsByteArray());
    }
}
