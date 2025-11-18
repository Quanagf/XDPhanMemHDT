package com.evrental.users.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evrental.users.model.RiskPointHistory;

@Repository
public interface RiskPointHistoryRepository extends JpaRepository<RiskPointHistory, Long> {
    
    List<RiskPointHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<RiskPointHistory> findByAddedByOrderByCreatedAtDesc(Long addedBy);
    
    long countByUserId(Long userId);
}
