package com.travelguide.repository;

import com.travelguide.entity.Guide;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GuideRepository extends JpaRepository<Guide, Long> {
    List<Guide> findByLocationId(Long locationId);
}
