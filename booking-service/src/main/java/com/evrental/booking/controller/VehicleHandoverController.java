package com.evrental.booking.controller;

import com.evrental.booking.dto.*;
import com.evrental.booking.service.VehicleHandoverService;
import com.evrental.booking.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/handovers")
@RequiredArgsConstructor
@Slf4j
public class VehicleHandoverController {

    private final VehicleHandoverService handoverService;
    private final JwtService jwtService;

    /**
     * Nhận xe (PICKUP) - Staff xác nhận khách đến, chụp ảnh xe, tạo hợp đồng, thu cọc
     */
    @PostMapping("/pickup")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<HandoverDetailsDTO> processPickup(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("bookingId") Long bookingId,
            @RequestParam("customerArrived") Boolean customerArrived,
            @RequestParam("customerVerified") Boolean customerVerified,
            @RequestParam(value = "vehicleImages", required = false) List<MultipartFile> vehicleImages,
            @RequestParam(value = "vehicleConditionNotes", required = false) String vehicleConditionNotes,
            @RequestParam("depositAmount") String depositAmount,
            @RequestParam("paymentMethod") String paymentMethod,
            @RequestParam(value = "renterSignature", required = false) String renterSignature,
            @RequestParam(value = "staffSignature", required = false) String staffSignature,
            @RequestParam(value = "renterSignatureFile", required = false) MultipartFile renterSignatureFile,
            @RequestParam(value = "staffSignatureFile", required = false) MultipartFile staffSignatureFile
    ) {
        try {
            // Extract staff ID from JWT
            String token = authHeader.replace("Bearer ", "");
            Long staffId = jwtService.getUserIdFromToken(token);

            VehiclePickupRequest request = VehiclePickupRequest.builder()
                    .bookingId(bookingId)
                    .staffId(staffId)
                    .customerArrived(customerArrived)
                    .customerVerified(customerVerified)
                    .vehicleConditionNotes(vehicleConditionNotes)
                    .depositAmount(new java.math.BigDecimal(depositAmount))
                    .paymentMethod(paymentMethod)
                    .renterSignature(renterSignature)
                    .staffSignature(staffSignature)
                    .build();

            HandoverDetailsDTO result = handoverService.processPickup(request, vehicleImages, renterSignatureFile, staffSignatureFile);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi xử lý nhận xe: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Trả xe (RETURN) - Staff xác thực xe, chụp ảnh, tính phí phát sinh, thu tiền
     */
    @PostMapping("/return")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<HandoverDetailsDTO> processReturn(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("bookingId") Long bookingId,
            @RequestParam("vehicleVerified") Boolean vehicleVerified,
            @RequestParam(value = "vehicleImages", required = false) List<MultipartFile> vehicleImages,
            @RequestParam(value = "vehicleConditionNotes", required = false) String vehicleConditionNotes,
            @RequestParam(value = "additionalCharges", required = false, defaultValue = "0") String additionalCharges,
            @RequestParam(value = "additionalChargesReason", required = false) String additionalChargesReason,
            @RequestParam("finalPaymentAmount") String finalPaymentAmount,
            @RequestParam("paymentMethod") String paymentMethod,
            @RequestParam(value = "renterSignature", required = false) String renterSignature,
            @RequestParam(value = "staffSignature", required = false) String staffSignature,
            @RequestParam(value = "renterSignatureFile", required = false) MultipartFile renterSignatureFile,
            @RequestParam(value = "staffSignatureFile", required = false) MultipartFile staffSignatureFile
    ) {
        try {
            // Extract staff ID from JWT
            String token = authHeader.replace("Bearer ", "");
            Long staffId = jwtService.getUserIdFromToken(token);

            VehicleReturnRequest request = VehicleReturnRequest.builder()
                    .bookingId(bookingId)
                    .staffId(staffId)
                    .vehicleVerified(vehicleVerified)
                    .vehicleConditionNotes(vehicleConditionNotes)
                    .additionalCharges(new java.math.BigDecimal(additionalCharges))
                    .additionalChargesReason(additionalChargesReason)
                    .finalPaymentAmount(new java.math.BigDecimal(finalPaymentAmount))
                    .paymentMethod(paymentMethod)
                    .renterSignature(renterSignature)
                    .staffSignature(staffSignature)
                    .build();

            HandoverDetailsDTO result = handoverService.processReturn(request, vehicleImages, renterSignatureFile, staffSignatureFile);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi xử lý trả xe: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Hủy booking khi khách không đến nhận xe
     */
    @PostMapping("/cancel/{bookingId}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String reason
    ) {
        try {
            handoverService.cancelBooking(bookingId, reason);
            return ResponseEntity.ok().body("Đã hủy booking thành công");
        } catch (Exception e) {
            log.error("Lỗi hủy booking: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể hủy booking: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách xe cần nhận (PICKUP) - có filter theo ngày và tên khách
     */
    @GetMapping("/pending-pickups")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<HandoverDetailsDTO>> getPendingPickups(
            @RequestParam("stationId") Long stationId,
            @RequestParam(value = "startDate", required = false) 
                @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(value = "endDate", required = false) 
                @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(value = "customerName", required = false) String customerName
    ) {
        try {
            List<HandoverDetailsDTO> pickups = handoverService.getPendingPickups(
                stationId, 
                startDate != null ? startDate.atStartOfDay() : null,
                endDate != null ? endDate.atTime(23, 59, 59) : null,
                customerName);
            return ResponseEntity.ok(pickups);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách xe cần nhận: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Lấy danh sách xe cần trả (RETURN) - có filter theo ngày và tên khách
     */
    @GetMapping("/pending-returns")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<HandoverDetailsDTO>> getPendingReturns(
            @RequestParam("stationId") Long stationId,
            @RequestParam(value = "startDate", required = false) 
                @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(value = "endDate", required = false) 
                @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(value = "customerName", required = false) String customerName
    ) {
        try {
            List<HandoverDetailsDTO> returns = handoverService.getPendingReturns(
                stationId,
                startDate != null ? startDate.atStartOfDay() : null,
                endDate != null ? endDate.atTime(23, 59, 59) : null,
                customerName);
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách xe cần trả: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Lấy lịch sử handovers của một booking
     */
    @GetMapping("/history/{bookingId}")
    @PreAuthorize("hasAnyRole('STAFF', 'CUSTOMER')")
    public ResponseEntity<List<HandoverDetailsDTO>> getHandoverHistory(
            @PathVariable Long bookingId
    ) {
        try {
            List<HandoverDetailsDTO> history = handoverService.getHandoverHistory(bookingId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Lỗi lấy lịch sử handover: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}
