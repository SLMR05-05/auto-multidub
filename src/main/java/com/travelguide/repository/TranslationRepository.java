package com.travelguide.repository;

import com.travelguide.entity.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TranslationRepository extends JpaRepository<Translation, Long> {
    List<Translation> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
}
