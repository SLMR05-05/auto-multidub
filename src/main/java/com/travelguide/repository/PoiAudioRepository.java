package com.travelguide.repository;

import com.travelguide.entity.PoiAudio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PoiAudioRepository extends JpaRepository<PoiAudio, Long> {

    List<PoiAudio> findByPoiIdOrderByLanguageCodeAsc(Long poiId);

    List<PoiAudio> findByPoiIdIn(Collection<Long> poiIds);

    Optional<PoiAudio> findByPoiIdAndLanguageCode(Long poiId, String languageCode);

    boolean existsByPoiIdAndLanguageCode(Long poiId, String languageCode);

    @Query("select a.poi.id, count(a) from PoiAudio a where a.poi.id in :poiIds group by a.poi.id")
    List<Object[]> countGroupedByPoiIds(@Param("poiIds") Collection<Long> poiIds);

    void deleteByPoiId(Long poiId);
}
