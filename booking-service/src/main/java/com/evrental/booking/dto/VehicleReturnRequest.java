package com.evrental.booking.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleReturnRequest {
    private Long bookingId;
    private Long staffId;
    private Boolean vehicleVerified;  // Đã xác minh xe trả đúng
    private List<String> vehicleImageUrls;  // URLs ảnh tình trạng xe khi trả
    private String vehicleConditionNotes;  // Ghi chú tình trạng xe
    private BigDecimal additionalCharges;  // Phí phát sinh (nếu có)
    private String additionalChargesReason;  // Lý do phí phát sinh
    private BigDecimal finalPaymentAmount;  // Số tiền thanh toán cuối
    private String paymentMethod;  // CASH, BANK_TRANSFER, MOMO...
    private String renterSignature;  // Chữ ký điện tử khách thuê
    private String staffSignature;  // Chữ ký điện tử nhân viên
}
