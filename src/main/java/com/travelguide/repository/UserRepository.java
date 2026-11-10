package com.travelguide.repository;

import com.travelguide.entity.AppUser;
import com.travelguide.entity.Role;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from AppUser account where account.email = :email")
    Optional<AppUser> findByEmailForUpdate(@Param("email") String email);

    boolean existsByEmail(String email);

    List<AppUser> findByRoleOrderByFullNameAsc(Role role);

    List<AppUser> findAllByOrderByCreatedAtDesc();
}

