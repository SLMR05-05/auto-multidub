package com.travelguide.repository;

import com.travelguide.entity.Poi;
import com.travelguide.entity.PoiStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PoiRepository extends JpaRepository<Poi, Long> {

    Optional<Poi> findByCode(String code);

    boolean existsByCode(String code);

    List<Poi> findByStatusOrderByNameAsc(PoiStatus status);

    List<Poi> findByStatusInOrderByNameAsc(Collection<PoiStatus> statuses);

    List<Poi> findByVersionGreaterThanAndStatusInOrderByIdAsc(long version, Collection<PoiStatus> statuses);

    long countByStatus(PoiStatus status);

    boolean existsByWardId(Long wardId);

    boolean existsByBusStopId(Long busStopId);

    List<Poi> findByWardIdOrderByNameAsc(Long wardId);

    @Query("""
            select p from Poi p
            where (:search is null or lower(p.name) like lower(concat('%', :search, '%'))
                   or lower(p.code) like lower(concat('%', :search, '%')))
              and (:status is null or p.status = :status)
              and (:wardId is null or p.ward.id = :wardId)
              and (:missingTranslationLang is null or not exists
                   (select t from PoiTranslation t where t.poi = p and t.languageCode = :missingTranslationLang))
              and (:missingAudioLang is null or not exists
                   (select a from PoiAudio a where a.poi = p and a.languageCode = :missingAudioLang))
            """)
    Page<Poi> search(@Param("search") String search,
                     @Param("status") PoiStatus status,
                     @Param("wardId") Long wardId,
                     @Param("missingTranslationLang") String missingTranslationLang,
                     @Param("missingAudioLang") String missingAudioLang,
                     Pageable pageable);
}
