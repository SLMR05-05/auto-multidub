package com.travelguide.controller;

import com.travelguide.dto.CommonDtos.MessageResponse;
import com.travelguide.dto.PackageDtos.CreateRequest;
import com.travelguide.dto.PackageDtos.Response;
import com.travelguide.entity.OfflinePackage;
import com.travelguide.entity.PackageStatus;
import com.travelguide.service.OfflinePackageService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/offline-packages")
@PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
public class AdminPackageController {

    private final OfflinePackageService packages;

    public AdminPackageController(OfflinePackageService packages) {
        this.packages = packages;
    }

    @GetMapping
    public List<Response> list() {
        return packages.list();
    }

    @PostMapping
    public Response create(@Valid @RequestBody CreateRequest request) {
        return packages.create(request);
    }

    @DeleteMapping("/{id}")
    public MessageResponse delete(@PathVariable Long id) {
        packages.delete(id);
        return new MessageResponse("Offline package deleted");
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        OfflinePackage pkg = packages.find(id);
        if (pkg.getStatus() != PackageStatus.READY || pkg.getFilePath() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package is not ready");
        }
        Path path = Path.of(pkg.getFilePath()).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package file missing");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + pkg.getCode() + ".zip\"")
                .body(new FileSystemResource(path));
    }
}
