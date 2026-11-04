package com.travelguide.controller;

import com.travelguide.dto.CommonDtos.MessageResponse;
import com.travelguide.dto.CommonDtos.PageResponse;
import com.travelguide.dto.PoiDtos;
import com.travelguide.dto.PoiDtos.*;
import com.travelguide.entity.PoiStatus;
import com.travelguide.service.MediaService;
import com.travelguide.service.PoiService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/pois")
@PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
public class AdminPoiController {

    private final PoiService pois;
    private final MediaService media;

    public AdminPoiController(PoiService pois, MediaService media) {
        this.pois = pois;
        this.media = media;
    }

    @GetMapping
    public PageResponse<AdminResponse> list(@RequestParam(required = false) String search,
                                            @RequestParam(required = false) PoiStatus status,
                                            @RequestParam(required = false) Long wardId,
                                            @RequestParam(required = false) String missingTranslation,
                                            @RequestParam(required = false) String missingAudio,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return pois.adminSearch(search, status, wardId, missingTranslation, missingAudio, page, size);
    }

    @PostMapping
    public AdminResponse create(@Valid @RequestBody PoiRequest request) {
        return pois.create(request);
    }

    @GetMapping("/{id}")
    public AdminResponse get(@PathVariable Long id) {
        return pois.adminGet(id);
    }

    @PutMapping("/{id}")
    public AdminResponse update(@PathVariable Long id, @Valid @RequestBody PoiRequest request) {
        return pois.update(id, request);
    }

    @DeleteMapping("/{id}")
    public MessageResponse archive(@PathVariable Long id,
                                   @RequestParam(defaultValue = "false") boolean force) {
        pois.archive(id, force);
        return new MessageResponse("POI archived");
    }

    @PostMapping("/{id}/publish")
    public PublishResult publish(@PathVariable Long id) {
        return pois.publish(id);
    }

    @GetMapping("/{id}/translations")
    public List<TranslationResponse> translations(@PathVariable Long id) {
        return pois.listTranslations(id);
    }

    @PutMapping("/{id}/translations/{languageCode}")
    public TranslationResponse upsertTranslation(@PathVariable Long id,
                                                 @PathVariable String languageCode,
                                                 @Valid @RequestBody TranslationRequest request) {
        return pois.upsertTranslation(id, languageCode, request);
    }

    @DeleteMapping("/{id}/translations/{languageCode}")
    public MessageResponse deleteTranslation(@PathVariable Long id,
                                             @PathVariable String languageCode) {
        pois.deleteTranslation(id, languageCode);
        return new MessageResponse("Translation deleted");
    }

    @GetMapping("/{id}/coverage")
    public CoverageResponse coverage(@PathVariable Long id) {
        return pois.coverage(id);
    }

    @GetMapping("/coverage/all")
    public List<CoverageResponse> coverageAll() {
        return pois.coverageAll();
    }

    @PostMapping("/{id}/audio")
    public AudioResponse uploadAudio(@PathVariable Long id,
                                     @RequestParam(defaultValue = "vi") String lang,
                                     @RequestParam("file") MultipartFile file) {
        return media.uploadAudio(id, lang, file);
    }

    @DeleteMapping("/{id}/audio/{languageCode}")
    public MessageResponse deleteAudio(@PathVariable Long id, @PathVariable String languageCode) {
        media.deleteAudio(id, languageCode);
        return new MessageResponse("Audio deleted");
    }

    @PostMapping("/{id}/images")
    public ImageResponse uploadImage(@PathVariable Long id,
                                     @RequestParam("file") MultipartFile file) {
        return media.uploadImage(id, file);
    }

    @PutMapping("/{id}/images/order")
    public List<ImageResponse> reorderImages(@PathVariable Long id,
                                             @Valid @RequestBody ImageOrderRequest request) {
        return media.reorderImages(id, request.imageIds());
    }

    @PutMapping("/{id}/images/{imageId}/cover")
    public ImageResponse setCover(@PathVariable Long id, @PathVariable Long imageId) {
        return media.setCover(id, imageId);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public MessageResponse deleteImage(@PathVariable Long id, @PathVariable Long imageId) {
        media.deleteImage(id, imageId);
        return new MessageResponse("Image deleted");
    }
}
