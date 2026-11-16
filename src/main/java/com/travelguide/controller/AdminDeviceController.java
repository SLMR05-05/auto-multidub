package com.travelguide.controller;

import com.travelguide.dto.IngestDtos.AdminDeviceSummary;
import com.travelguide.dto.IngestDtos.DeleteDeviceResponse;
import com.travelguide.dto.IngestDtos.DeviceResponse;
import com.travelguide.service.DeviceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/devices")
@PreAuthorize("hasAnyRole('ADMIN','ANALYST','EDITOR')")
public class AdminDeviceController {

    private final DeviceService devices;

    public AdminDeviceController(DeviceService devices) {
        this.devices = devices;
    }

    @GetMapping
    public AdminDeviceSummary list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String os) {
        return devices.listAdminDevices(search, type, os);
    }

    @GetMapping("/{deviceId}")
    public DeviceResponse get(@PathVariable String deviceId) {
        return devices.get(deviceId);
    }

    @DeleteMapping("/{deviceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public DeleteDeviceResponse delete(@PathVariable String deviceId) {
        return devices.deleteData(deviceId);
    }
}

