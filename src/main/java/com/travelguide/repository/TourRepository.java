package com.travelguide.repository;

import com.travelguide.entity.Tour;
import com.travelguide.entity.TourStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TourRepository extends JpaRepository<Tour, Long> {

    Optional<Tour> findByCode(String code);

    boolean existsByCode(String code);

    List<Tour> findByStatusOrderByNameAsc(TourStatus status);

    List<Tour> findByVersionGreaterThanAndStatusInOrderByIdAsc(long version, Collection<TourStatus> statuses);

    @Query("""
            select t from Tour t
            where (:search is null or lower(t.name) like lower(concat('%', :search, '%'))
                   or lower(t.code) like lower(concat('%', :search, '%')))
              and (:status is null or t.status = :status)
            """)
    Page<Tour> search(@Param("search") String search,
                      @Param("status") TourStatus status,
                      Pageable pageable);
}
