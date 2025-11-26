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
public class VehiclePickupRequest {
    private Long bookingId;
    private Long staffId;
    private Boolean customerArrived;  // Khách hàng đã đến
    private Boolean customerVerified;  // Đã xác thực GPLX/CCCD
    private List<String> vehicleImageUrls;  // URLs ảnh xe (đã upload lên MinIO)
    private String vehicleConditionNotes;  // Ghi chú tình trạng xe
    private BigDecimal depositAmount;  // Tiền đặt cọc
    private String paymentMethod;  // CASH, BANK_TRANSFER, MOMO...
    private String renterSignature;  // Chữ ký điện tử khách thuê
    private String staffSignature;  // Chữ ký điện tử nhân viên
}
