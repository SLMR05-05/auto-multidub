package com.travelguide.repository;

import com.travelguide.entity.SystemSetting;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from SystemSetting s where s.key = :key")
    Optional<SystemSetting> findForUpdate(@Param("key") String key);
}
