package com.travelguide.repository;

import com.travelguide.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BusStopRepository extends JpaRepository<BusStop, Long> {

    Optional<BusStop> findByCode(String code);

    boolean existsByCode(String code);

    List<BusStop> findAllByOrderByNameAsc();

    List<BusStop> findByWardIdOrderByNameAsc(Long wardId);

    boolean existsByWardId(Long wardId);
}
