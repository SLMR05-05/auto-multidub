package com.travelguide.repository;

import com.travelguide.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoryRepository extends JpaRepository<History, Long> {
    List<History> findTop100ByUserIdOrderByCreatedAtDesc(Long userId);
}
