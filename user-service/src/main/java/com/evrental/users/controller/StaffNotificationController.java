package com.evrental.users.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.evrental.users.model.StaffNotification;
import com.evrental.users.service.StaffNotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/staff-notifications")
@RequiredArgsConstructor
public class StaffNotificationController {

    private final StaffNotificationService notificationService;

    @GetMapping("/station/{stationId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffNotification>> getStationNotifications(@PathVariable Long stationId) {
        List<StaffNotification> notifications = notificationService.getNotificationsByStationId(stationId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/station/{stationId}/unread")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffNotification>> getUnreadNotifications(@PathVariable Long stationId) {
        List<StaffNotification> notifications = notificationService.getUnreadNotificationsByStationId(stationId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/station/{stationId}/unread/count")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long stationId) {
        Long count = notificationService.getUnreadCountByStationId(stationId);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/station/{stationId}/read-all")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long stationId) {
        notificationService.markAllAsRead(stationId);
        return ResponseEntity.ok().build();
    }
}