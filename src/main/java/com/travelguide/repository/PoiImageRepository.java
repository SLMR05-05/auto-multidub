package com.travelguide.repository;

import com.travelguide.entity.PoiImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PoiImageRepository extends JpaRepository<PoiImage, Long> {

    List<PoiImage> findByPoiIdOrderBySortOrderAsc(Long poiId);

    List<PoiImage> findByPoiIdIn(Collection<Long> poiIds);

    void deleteByPoiId(Long poiId);

    @Query("select coalesce(max(i.sortOrder), -1) from PoiImage i where i.poi.id = :poiId")
    int findMaxSortOrder(@Param("poiId") Long poiId);

    @Query("select i.poi.id, count(i) from PoiImage i where i.poi.id in :poiIds group by i.poi.id")
    List<Object[]> countGroupedByPoiIds(@Param("poiIds") Collection<Long> poiIds);
}
