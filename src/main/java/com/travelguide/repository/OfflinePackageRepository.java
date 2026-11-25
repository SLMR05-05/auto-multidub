package com.travelguide.repository;

import com.travelguide.entity.OfflinePackage;
import com.travelguide.entity.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface OfflinePackageRepository extends JpaRepository<OfflinePackage, Long> {

    List<OfflinePackage> findAllByOrderByCreatedAtDesc();

    List<OfflinePackage> findByStatusOrderByCreatedAtDesc(PackageStatus status);

    List<OfflinePackage> findByLanguageCodeAndStatusOrderByCreatedAtDesc(String languageCode, PackageStatus status);

    boolean existsByCode(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from OfflinePackage p where p.id = :id")
    Optional<OfflinePackage> findForBuild(Long id);
}
