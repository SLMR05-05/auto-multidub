package com.travelguide;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.travelguide.entity.PoiStatus;
import com.travelguide.entity.OfflinePackage;
import com.travelguide.entity.PackageStatus;
import com.travelguide.entity.Role;
import com.travelguide.repository.OfflinePackageRepository;
import com.travelguide.repository.UserRepository;
import com.travelguide.repository.PoiRepository;
import com.travelguide.service.DataVersionService;
import com.travelguide.service.OfflinePackageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipInputStream;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:poi_creation;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "app.offline-packages.worker-enabled=true",
        "app.offline-packages.build-delay-ms=100",
        "app.storage.audio-dir=./target/poi-flow/audio",
        "app.storage.image-dir=./target/poi-flow/images",
        "app.storage.package-dir=./target/poi-flow/packages"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PoiCreationFlowTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired PoiRepository pois;
    @Autowired DataVersionService versions;
    @Autowired OfflinePackageService packages;
    @Autowired OfflinePackageRepository packageRepository;
    @Autowired UserRepository users;

    @Test
    void editorSaveRollsBackAllTextAndCreationWhenAnyLanguageFails() throws Exception {
        String token = login();
        String code = unique();
        ObjectNode body = editorBody(code, "Kịch bản tiếng Việt");
        ((ObjectNode) body.get("translations")).set("unsupported-language",
                mapper.valueToTree(Map.of("name", "Invalid language", "description", "Text")));
        mvc.perform(post("/api/v1/admin/pois/editor").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest());
        assertFalse(pois.existsByCode(code), "A failed language must not leave a partial POI");

        ObjectNode valid = editorBody(code, "Original script");
        long id = create(token, valid).get("poi").get("id").asLong();
        ((ObjectNode) body.get("poi")).put("name", "Must roll back");
        mvc.perform(put("/api/v1/admin/pois/" + id + "/editor").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest());
        JsonNode persisted = editor(token, id);
        assertEquals(code, persisted.get("poi").get("name").asText());
        assertEquals("Original script", persisted.get("translations").get(0).get("ttsScript").asText());

        ((ObjectNode) valid.get("poi")).put("latitude", 91);
        mvc.perform(put("/api/v1/admin/pois/" + id + "/editor").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(valid.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("poi.latitude"));
    }

    @Test
    void audioAndImagesSurviveReloadPublishSyncAndAutomaticOfflineBuild() throws Exception {
        String token = login();
        ObjectNode body = editorBody(unique(), "");
        ((ObjectNode) body.get("translations")).set("en", mapper.valueToTree(Map.of(
                "name", "English POI", "description", "English description", "ttsScript", "English narration")));
        long id = create(token, body).get("poi").get("id").asLong();
        mvc.perform(post("/api/v1/admin/pois/" + id + "/ready").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.issues.length()").value(1))
                .andExpect(jsonPath("$.poi.status").value("DRAFT"));

        byte[] audioBytes = Files.readAllBytes(Path.of("audio/poi_1_vi.mp3"));
        mvc.perform(multipart("/api/v1/admin/pois/" + id + "/audio")
                        .file(new MockMultipartFile("file", "narration.mp3", "audio/mpeg", audioBytes))
                        .param("lang", "vi").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.checksumSha256").isString())
                .andExpect(jsonPath("$.durationSeconds").value(org.hamcrest.Matchers.greaterThan(0.0)));
        // A language has one recording, even after replacement.
        mvc.perform(multipart("/api/v1/admin/pois/" + id + "/audio")
                        .file(new MockMultipartFile("file", "replacement.mp3", "audio/mpeg", audioBytes))
                        .param("lang", "vi").header("Authorization", token))
                .andExpect(status().isOk());
        long firstImage = uploadImage(token, id, "first.png");
        long cover = uploadImage(token, id, "cover.png");
        mvc.perform(put("/api/v1/admin/pois/" + id + "/images/order").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("imageIds", List.of(cover, firstImage)))))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(cover));
        mvc.perform(put("/api/v1/admin/pois/" + id + "/images/" + cover + "/cover").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.coverImage").value(true));

        JsonNode reloaded = editor(token, id);
        assertEquals(2, reloaded.get("translations").size());
        assertEquals(1, reloaded.get("audios").size());
        assertEquals("replacement.mp3", reloaded.get("audios").get(0).get("fileName").asText());
        assertEquals(cover, reloaded.get("images").get(0).get("id").asLong());
        mvc.perform(post("/api/v1/admin/pois/" + id + "/ready").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.poi.status").value("READY"))
                .andExpect(jsonPath("$.issues.length()").value(0));
        mvc.perform(get("/api/v1/app/pois/" + id)).andExpect(status().isNotFound());

        long before = versions.current();
        long version = json(mvc.perform(post("/api/v1/admin/publish").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("poiIds", List.of(id)))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.publishedCount").value(1))
                .andExpect(jsonPath("$.issues.length()").value(0)).andReturn()).get("dataVersion").asLong();
        assertEquals(before + 1, version);
        mvc.perform(get("/api/v1/app/sync").param("sinceVersion", Long.toString(before)).param("lang", "en"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.pois[?(@.id == " + id + ")].localizedName",
                        org.hamcrest.Matchers.hasItem("English POI")));
        mvc.perform(get("/api/v1/app/pois/" + id).param("lang", "vi"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.images[0].coverImage").value(true))
                .andExpect(jsonPath("$.audios[0].fileName").value("replacement.mp3"));

        await().atMost(Duration.ofSeconds(25)).untilAsserted(() ->
                assertEquals(7, packages.list().stream().filter(pkg -> pkg.dataVersion() == version
                        && pkg.status().equals("READY")).map(pkg -> pkg.languageCode()).distinct().count()));
        var pkg = packages.list().stream().filter(item -> item.dataVersion() == version
                && item.languageCode().equals("vi") && item.status().equals("READY")).findFirst().orElseThrow();
        byte[] zipBytes = mvc.perform(get(pkg.downloadUrl())).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsByteArray();
        assertEquals(pkg.checksumSha256(), HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(zipBytes)));
        JsonNode manifest = null;
        boolean audioIncluded = false;
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
                if (entry.getName().equals("manifest.json")) manifest = mapper.readTree(zip.readAllBytes());
                if (entry.getName().equals("audio/" + id + "/audio.mp3")) {
                    assertArrayEquals(audioBytes, zip.readAllBytes());
                    audioIncluded = true;
                }
            }
        }
        assertTrue(audioIncluded);
        assertNotNull(manifest);
        assertEquals(version, manifest.get("dataVersion").asLong());
        boolean containsPoi = false;
        for (JsonNode item : manifest.get("pois")) {
            if (item.get("id").asLong() == id) {
                assertEquals(2, item.get("images").size());
                assertEquals("replacement.mp3", reloaded.get("audios").get(0).get("fileName").asText());
                containsPoi = true;
            }
        }
        assertTrue(containsPoi, "Automatic ZIP must include the newly published POI");
    }

    @Test
    void batchGateIsAtomicAndEditingReadyContentRequiresRecheck() throws Exception {
        String token = login();
        long good = create(token, editorBody(unique(), "Ready script")).get("poi").get("id").asLong();
        long bad = create(token, editorBody(unique(), "")).get("poi").get("id").asLong();
        mvc.perform(post("/api/v1/admin/pois/" + good + "/ready").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.poi.status").value("READY"));
        long before = versions.current();
        int packageCount = packages.list().size();
        mvc.perform(post("/api/v1/admin/publish").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("poiIds", List.of(good, bad)))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.publishedCount").value(0))
                .andExpect(jsonPath("$.issues[0].poiId").value(bad));
        assertEquals(before, versions.current());
        assertEquals(packageCount, packages.list().size());
        assertEquals(PoiStatus.READY, pois.findById(good).orElseThrow().getStatus());
        mvc.perform(put("/api/v1/admin/pois/" + good + "/translations/vi").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Changed\",\"description\":\"Description\",\"ttsScript\":\"\"}"))
                .andExpect(status().isOk());
        assertEquals(PoiStatus.DRAFT, pois.findById(good).orElseThrow().getStatus());
        mvc.perform(post("/api/v1/admin/pois/" + good + "/ready").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.issues.length()").value(1));
    }

    @Test
    void defaultCatalogPublicationIncludesReadyPoisButNotUnfinishedDrafts() throws Exception {
        String token = login();
        long ready = create(token, editorBody(unique(), "Valid script")).get("poi").get("id").asLong();
        long draft = create(token, editorBody(unique(), "")).get("poi").get("id").asLong();
        mvc.perform(post("/api/v1/admin/pois/" + ready + "/ready").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.poi.status").value("READY"));
        mvc.perform(post("/api/v1/admin/publish").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.issues.length()").value(0));
        assertEquals(PoiStatus.PUBLISHED, pois.findById(ready).orElseThrow().getStatus());
        assertEquals(PoiStatus.DRAFT, pois.findById(draft).orElseThrow().getStatus());
    }

    @Test
    void uploadRejectsWrongFormatsAndImageOrderingCannotIncludeAnotherPoisImage() throws Exception {
        String token = login();
        long id = create(token, editorBody(unique(), "TTS")).get("poi").get("id").asLong();
        long other = create(token, editorBody(unique(), "Other TTS")).get("poi").get("id").asLong();
        long own = uploadImage(token, id, "own.png");
        long foreign = uploadImage(token, other, "foreign.png");
        mvc.perform(put("/api/v1/admin/pois/" + id + "/images/order").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("imageIds", List.of(foreign)))))
                .andExpect(status().isBadRequest());
        assertEquals(own, editor(token, id).get("images").get(0).get("id").asLong());
        mvc.perform(multipart("/api/v1/admin/pois/" + id + "/audio")
                        .file(new MockMultipartFile("file", "bad.exe", "application/octet-stream", new byte[]{1}))
                        .header("Authorization", token))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/v1/admin/pois/" + id + "/images")
                        .file(new MockMultipartFile("file", "large.png", "image/png", new byte[5 * 1024 * 1024 + 1]))
                        .header("Authorization", token))
                .andExpect(status().isPayloadTooLarge());
        mvc.perform(delete("/api/v1/admin/pois/" + id + "/images/" + own).header("Authorization", token))
                .andExpect(status().isOk());
        assertEquals(0, editor(token, id).get("images").size());
    }

    @Test
    void newEditorEndpointsRequireCmsRoleAndArchivedPoisCannotPublish() throws Exception {
        String email = unique() + "@test.local";
        String userBody = mapper.writeValueAsString(Map.of("email", email, "password", "Valid123!", "fullName", "Visitor"));
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(userBody))
                .andExpect(status().isOk());
        String visitor = "Bearer " + json(mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(userBody)).andExpect(status().isOk()).andReturn()).get("token").asText();
        mvc.perform(post("/api/v1/admin/pois/editor").header("Authorization", visitor)
                        .contentType(MediaType.APPLICATION_JSON).content(editorBody(unique(), "TTS").toString()))
                .andExpect(status().isForbidden());
        var user = users.findByEmail(email).orElseThrow();
        user.setRole(Role.EDITOR);
        users.save(user);
        String editorToken = "Bearer " + json(mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(userBody)).andExpect(status().isOk()).andReturn()).get("token").asText();
        long editable = create(editorToken, editorBody(unique(), "Editor TTS")).get("poi").get("id").asLong();
        mvc.perform(post("/api/v1/admin/pois/" + editable + "/publish").header("Authorization", editorToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.publishedCount").value(1));
        String admin = login();
        long id = create(admin, editorBody(unique(), "TTS")).get("poi").get("id").asLong();
        mvc.perform(delete("/api/v1/admin/pois/" + id).header("Authorization", admin)).andExpect(status().isOk());
        mvc.perform(post("/api/v1/admin/pois/" + id + "/publish").header("Authorization", admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.publishedCount").value(0))
                .andExpect(jsonPath("$.issues.length()").value(1));
    }

    @Test
    void failedPackageCanBeRequeuedAndBuiltByTheBackgroundWorker() throws Exception {
        String token = login();
        long id = create(token, editorBody(unique(), "Offline TTS")).get("poi").get("id").asLong();
        mvc.perform(post("/api/v1/admin/pois/" + id + "/publish").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.publishedCount").value(1));
        OfflinePackage failed = new OfflinePackage();
        failed.setCode(unique());
        failed.setName("Retry package");
        failed.setLanguageCode("vi");
        failed.setStatus(PackageStatus.FAILED);
        failed.setErrorMessage("Previous build interrupted");
        long packageId = packageRepository.save(failed).getId();
        mvc.perform(post("/api/v1/admin/offline-packages/" + packageId + "/retry").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("BUILDING"))
                .andExpect(jsonPath("$.errorMessage").doesNotExist());
        await().atMost(Duration.ofSeconds(25)).untilAsserted(() ->
                assertEquals(PackageStatus.READY, packageRepository.findById(packageId).orElseThrow().getStatus()));
        assertNotNull(packageRepository.findById(packageId).orElseThrow().getChecksumSha256());
        mvc.perform(post("/api/v1/admin/offline-packages/" + packageId + "/retry").header("Authorization", token))
                .andExpect(status().isConflict());
    }

    private long uploadImage(String token, long id, String name) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(16, 16, BufferedImage.TYPE_INT_RGB), "png", bytes);
        return json(mvc.perform(multipart("/api/v1/admin/pois/" + id + "/images")
                        .file(new MockMultipartFile("file", name, "image/png", bytes.toByteArray()))
                        .header("Authorization", token))
                .andExpect(status().isOk()).andReturn()).get("id").asLong();
    }

    private ObjectNode editorBody(String code, String script) {
        return mapper.valueToTree(Map.of(
                "poi", Map.of("code", code, "name", code, "latitude", 10.7681, "longitude", 106.7052,
                        "radiusMeters", 50, "priority", 3, "cooldownMinutes", 30),
                "translations", Map.of("vi", Map.of("name", code, "description", "Mô tả tiếng Việt", "ttsScript", script))));
    }

    private JsonNode create(String token, ObjectNode body) throws Exception {
        return json(mvc.perform(post("/api/v1/admin/pois/editor").header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.poi.status").value("DRAFT")).andReturn());
    }

    private JsonNode editor(String token, long id) throws Exception {
        return json(mvc.perform(get("/api/v1/admin/pois/" + id + "/editor").header("Authorization", token))
                .andExpect(status().isOk()).andReturn());
    }

    private String login() throws Exception {
        return "Bearer " + json(mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@test.local\",\"password\":\"Admin123!\"}"))
                .andExpect(status().isOk()).andReturn()).get("token").asText();
    }

    private JsonNode json(MvcResult result) throws Exception {
        return mapper.readTree(result.getResponse().getContentAsByteArray());
    }

    private String unique() { return "poi-test-" + UUID.randomUUID().toString().substring(0, 8); }
}
