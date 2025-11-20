package com.evrental.users.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.evrental.users.model.StaffNotification;

@Repository
public interface StaffNotificationRepository extends JpaRepository<StaffNotification, Long> {
    
    @Query("SELECT n FROM StaffNotification n WHERE n.stationId = :stationId ORDER BY n.createdAt DESC")
    List<StaffNotification> findByStationIdOrderByCreatedAtDesc(@Param("stationId") Long stationId);
    
    @Query("SELECT n FROM StaffNotification n WHERE n.stationId = :stationId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<StaffNotification> findUnreadByStationId(@Param("stationId") Long stationId);
    
    @Query("SELECT COUNT(n) FROM StaffNotification n WHERE n.stationId = :stationId AND n.isRead = false")
    Long countUnreadByStationId(@Param("stationId") Long stationId);
}