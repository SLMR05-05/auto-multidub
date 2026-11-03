package com.travelguide.service;

import com.travelguide.entity.History;
import com.travelguide.repository.HistoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HistoryService {
    private final HistoryRepository repository;
    public HistoryService(HistoryRepository repository) { this.repository = repository; }
    public List<History> findMine(Long userId) { return repository.findTop100ByUserIdOrderByCreatedAtDesc(userId); }
}
