package com.travelguide.controller;

import com.travelguide.dto.QrDtos.ResolveResponse;
import com.travelguide.service.QrCodeService;
import org.springframework.web.bind.annotation.*;

/**
 * Public QR landing URL encoded in the physical QR code:
 * https://<domain>/q/<code>. Android App Links intercepts this URL and opens
 * the app directly; the JSON response is the fallback for debugging/release 2.
 */
@RestController
public class QrResolveController {

    private final QrCodeService qrCodes;

    public QrResolveController(QrCodeService qrCodes) {
        this.qrCodes = qrCodes;
    }

    @GetMapping("/q/{code}")
    public ResolveResponse resolve(@PathVariable String code,
                                   @RequestParam(defaultValue = "vi") String lang) {
        return qrCodes.resolve(code, lang);
    }
}
