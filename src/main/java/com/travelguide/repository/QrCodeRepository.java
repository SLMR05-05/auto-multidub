package com.travelguide.repository;

import com.travelguide.entity.QrCode;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface QrCodeRepository extends JpaRepository<QrCode, Long> {

    @Override
    @EntityGraph(attributePaths = {"poi", "busStop"})
    Optional<QrCode> findById(Long id);

    Optional<QrCode> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByPoiIdAndActiveTrue(Long poiId);

    long countByPoiIdAndActiveTrue(Long poiId);

    List<QrCode> findAllByOrderByCreatedAtDesc();

    List<QrCode> findByPoiId(Long poiId);

    List<QrCode> findByActiveTrueOrderByCreatedAtDesc();

    List<QrCode> findByVersionGreaterThanOrderByVersionAsc(long version);

    List<QrCode> findByPoiIdInAndActiveTrue(Collection<Long> poiIds);

    boolean existsByBusStopId(Long busStopId);
}
