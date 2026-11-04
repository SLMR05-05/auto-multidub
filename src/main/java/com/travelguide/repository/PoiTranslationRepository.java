package com.travelguide.repository;

import com.travelguide.entity.PoiTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PoiTranslationRepository extends JpaRepository<PoiTranslation, Long> {

    List<PoiTranslation> findByPoiId(Long poiId);

    List<PoiTranslation> findByPoiIdIn(Collection<Long> poiIds);

    Optional<PoiTranslation> findByPoiIdAndLanguageCode(Long poiId, String languageCode);

    boolean existsByPoiIdAndLanguageCode(Long poiId, String languageCode);

    long countByPoiId(Long poiId);

    @Query("select t.poi.id, count(t) from PoiTranslation t where t.poi.id in :poiIds group by t.poi.id")
    List<Object[]> countGroupedByPoiIds(@Param("poiIds") Collection<Long> poiIds);

    void deleteByPoiId(Long poiId);
}
