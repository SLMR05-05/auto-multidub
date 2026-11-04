package com.travelguide.repository;

import com.travelguide.entity.OfflinePackage;
import com.travelguide.entity.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfflinePackageRepository extends JpaRepository<OfflinePackage, Long> {

    List<OfflinePackage> findAllByOrderByCreatedAtDesc();

    List<OfflinePackage> findByStatusOrderByCreatedAtDesc(PackageStatus status);

    List<OfflinePackage> findByLanguageCodeAndStatusOrderByCreatedAtDesc(String languageCode, PackageStatus status);

    boolean existsByCode(String code);
}
