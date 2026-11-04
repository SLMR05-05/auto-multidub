package com.travelguide.repository;

import com.travelguide.entity.TourPoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface TourPoiRepository extends JpaRepository<TourPoi, Long> {

    List<TourPoi> findByTourIdOrderByOrderIndexAsc(Long tourId);

    List<TourPoi> findByTourIdInOrderByTourIdAscOrderIndexAsc(Collection<Long> tourIds);

    List<TourPoi> findByPoiId(Long poiId);

    List<TourPoi> findByPoiIdIn(Collection<Long> poiIds);

    boolean existsByPoiId(Long poiId);

    boolean existsByTourIdAndPoiId(Long tourId, Long poiId);

    void deleteByTourId(Long tourId);

    void deleteByPoiId(Long poiId);

    @Query("select coalesce(max(tp.orderIndex), -1) from TourPoi tp where tp.tour.id = :tourId")
    int findMaxOrderIndex(@Param("tourId") Long tourId);
}
