package com.evrental.users.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.evrental.users.dto.StaffNotificationDTO;
import com.evrental.users.model.StaffNotification;
import com.evrental.users.repository.StaffNotificationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffNotificationService {

    private final StaffNotificationRepository notificationRepository;

    @RabbitListener(queues = "staff.notification.queue")
    public void receiveStaffNotification(StaffNotificationDTO notificationDTO) {
        try {
            log.info("Nhận thông báo mới cho station ID: {}, booking ID: {}", 
                    notificationDTO.getStationId(), notificationDTO.getBookingId());
            
            StaffNotification notification = StaffNotification.builder()
                .bookingId(notificationDTO.getBookingId())
                .stationId(notificationDTO.getStationId())
                .userId(notificationDTO.getUserId())
                .vehicleId(notificationDTO.getVehicleId())
                .customerName(notificationDTO.getCustomerName())
                .customerPhone(notificationDTO.getCustomerPhone())
                .customerEmail(notificationDTO.getCustomerEmail())
                .vehicleModel(notificationDTO.getVehicleModel())
                .vehiclePlate(notificationDTO.getVehiclePlate())
                .estimatedStartTime(notificationDTO.getEstimatedStartTime())
                .estimatedEndTime(notificationDTO.getEstimatedEndTime())
                .bookingTime(notificationDTO.getBookingTime())
                .notificationType(notificationDTO.getNotificationType())
                .message(notificationDTO.getMessage())
                .stationName(notificationDTO.getStationName())
                .stationAddress(notificationDTO.getStationAddress())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
            
            notificationRepository.save(notification);
            log.info("Đã lưu thông báo vào database cho station: {}", notificationDTO.getStationId());
            
        } catch (Exception e) {
            log.error("Lỗi khi xử lý thông báo: ", e);
        }
    }

    public List<StaffNotification> getNotificationsByStationId(Long stationId) {
        return notificationRepository.findByStationIdOrderByCreatedAtDesc(stationId);
    }

    public List<StaffNotification> getUnreadNotificationsByStationId(Long stationId) {
        return notificationRepository.findUnreadByStationId(stationId);
    }

    public Long getUnreadCountByStationId(Long stationId) {
        return notificationRepository.countUnreadByStationId(stationId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(Long stationId) {
        List<StaffNotification> unreadNotifications = notificationRepository.findUnreadByStationId(stationId);
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
    }
}