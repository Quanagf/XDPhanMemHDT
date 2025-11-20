package com.evrental.users.service;

import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.evrental.users.dto.StaffNotificationDTO;
import com.evrental.users.model.User;
import com.evrental.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffNotificationListener {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @RabbitListener(queues = "staff.notification.queue")
    public void handleStaffNotification(StaffNotificationDTO notification) {
        try {
            log.info("Nhận được thông báo booking mới: {}", notification.getBookingId());
            
            // Tìm tất cả staff được phân công tại trạm này
            List<User> staffAtStation = userRepository.findByRoleAndStationId(
                User.Role.STAFF, 
                notification.getStationId()
            );
            
            if (staffAtStation.isEmpty()) {
                log.warn("Không tìm thấy staff nào tại trạm ID: {}", notification.getStationId());
                return;
            }
            
            // Gửi thông báo đến tất cả staff tại trạm
            for (User staff : staffAtStation) {
                try {
                    sendNotificationToStaff(staff, notification);
                    log.info("Đã gửi thông báo đến staff: {} ({})", staff.getFullName(), staff.getEmail());
                } catch (Exception e) {
                    log.error("Lỗi khi gửi thông báo đến staff {}: {}", staff.getEmail(), e.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("Lỗi khi xử lý thông báo booking: {}", notification.getBookingId(), e);
        }
    }
    
    private void sendNotificationToStaff(User staff, StaffNotificationDTO notification) {
        // Tạo email thông báo
        String subject = String.format("🚗 Yêu cầu đặt xe mới - Booking #%d", notification.getBookingId());
        
        String emailBody = String.format("""
            Xin chào %s,
            
            Có yêu cầu đặt xe mới cần xử lý:
            
            📋 THÔNG TIN BOOKING:
            • Mã booking: #%d
            • Khách hàng: %s (%s)
            • Email khách hàng: %s
            • Xe: %s - %s
            • Thời gian nhận dự kiến: %s
            • Thời gian trả dự kiến: %s
            • Trạm: %s
            
            📱 HÀNH ĐỘNG CẦN THỰC HIỆN:
            1. Kiểm tra tình trạng xe
            2. Chuẩn bị xe cho khách hàng  
            3. Liên hệ khách hàng nếu cần thiết
            4. Cập nhật trạng thái trong hệ thống
            
            Vui lòng xử lý yêu cầu này trong thời gian sớm nhất.
            
            Trân trọng,
            Hệ thống EVRental
            """,
            staff.getFullName(),
            notification.getBookingId(),
            notification.getCustomerName(),
            notification.getCustomerPhone(),
            notification.getCustomerEmail(),
            notification.getVehicleModel(),
            notification.getVehiclePlate(),
            notification.getEstimatedStartTime(),
            notification.getEstimatedEndTime(),
            notification.getStationName()
        );
        
        // Gửi email
        emailService.sendSimpleEmail(staff.getEmail(), subject, emailBody);
        
        // Có thể thêm các phương thức thông báo khác như SMS, push notification, etc.
    }
}