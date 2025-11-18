package com.evrental.users.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evrental.users.model.User;
import com.evrental.users.model.User.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);
    
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Customer management queries
    List<User> findByRole(Role role);
    List<User> findByRoleAndIsRisky(Role role, Boolean isRisky);
    long countByRole(Role role);
    long countByRoleAndIsRisky(Role role, Boolean isRisky);
}