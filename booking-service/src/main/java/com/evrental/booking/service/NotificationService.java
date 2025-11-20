package com.evrental.booking.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.evrental.booking.config.RabbitMQConfig;
import com.evrental.booking.dto.StaffNotificationDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final RabbitTemplate rabbitTemplate;

    public void sendStaffNotification(StaffNotificationDTO notification) {
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.BOOKING_EXCHANGE,
                RabbitMQConfig.STAFF_NOTIFICATION_ROUTING_KEY,
                notification
            );
            log.info("Đã gửi thông báo đến staff cho booking ID: {}", notification.getBookingId());
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo đến staff cho booking ID: {}", notification.getBookingId(), e);
        }
    }

    public void sendNewBookingNotification(Long bookingId, Long stationId, String customerName, 
                                         String customerPhone, String vehicleInfo, 
                                         java.time.LocalDateTime estimatedStartTime) {
        StaffNotificationDTO notification = StaffNotificationDTO.builder()
            .bookingId(bookingId)
            .stationId(stationId)
            .customerName(customerName)
            .customerPhone(customerPhone)
            .estimatedStartTime(estimatedStartTime)
            .notificationType("NEW_BOOKING")
            .message(String.format("Có yêu cầu đặt xe mới từ khách hàng %s. Xe: %s. Thời gian nhận dự kiến: %s", 
                    customerName, vehicleInfo, estimatedStartTime))
            .build();
        
        sendStaffNotification(notification);
    }
}