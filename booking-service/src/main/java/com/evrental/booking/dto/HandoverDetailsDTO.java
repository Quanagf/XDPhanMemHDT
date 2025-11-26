package com.evrental.booking.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.evrental.booking.model.VehicleHandover;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverDetailsDTO {
    private Long id;
    private Long bookingId;
    private String bookingCode;  // Mã đặt xe
    private VehicleHandover.HandoverType handoverType;
    
    // Thông tin booking gốc
    private LocalDateTime bookingTime;  // Thời gian đặt
    private String bookingType;  // ADVANCE, ON_SPOT, WALK_IN
    private BigDecimal totalCost;  // Tổng tiền thuê
    
    // Thông tin khách hàng
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String gplxImageUrl;  // URL ảnh GPLX từ booking
    private String cccdImageUrl;  // URL ảnh CCCD từ booking
    
    // Thông tin xe
    private Long vehicleId;
    private String vehicleName;
    private String vehiclePlate;
    
    // Thông tin nhân viên
    private Long staffId;
    private String staffName;
    
    // Trạng thái bàn giao
    private Boolean customerArrived;
    private Boolean customerVerified;
    
    // Thông tin xe và hình ảnh
    private List<String> vehicleImageUrls;
    private String vehicleConditionNotes;
    
    // Thông tin thanh toán
    private BigDecimal depositAmount;
    private BigDecimal additionalCharges;
    private String additionalChargesReason;
    private BigDecimal finalPaymentAmount;
    private String paymentMethod;
    
    // Chữ ký
    private String renterSignature;
    private String staffSignature;
    private String contractUrl;
    
    // Thời gian
    private LocalDateTime estimatedTime;
    private LocalDateTime actualHandoverTime;
    private LocalDateTime createdAt;
}
