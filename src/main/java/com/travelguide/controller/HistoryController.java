package com.travelguide.controller;

import com.travelguide.entity.AppUser;
import com.travelguide.entity.History;
import com.travelguide.service.CurrentUserService;
import com.travelguide.service.HistoryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/history")
public class HistoryController {
    private final HistoryService service;
    private final CurrentUserService currentUser;
    public HistoryController(HistoryService service, CurrentUserService currentUser) {
        this.service = service; this.currentUser = currentUser;
    }
    @GetMapping
    public List<History> mine() {
        AppUser user = currentUser.get();
        return service.findMine(user.getId());
    }
}
