package com.travelguide.repository;

import com.travelguide.entity.AppUser;
import com.travelguide.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    List<AppUser> findByRoleOrderByFullNameAsc(Role role);

    List<AppUser> findAllByOrderByCreatedAtDesc();
}
