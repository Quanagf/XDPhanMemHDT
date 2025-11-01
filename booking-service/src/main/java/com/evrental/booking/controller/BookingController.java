package com.evrental.booking.controller;

import com.evrental.booking.dto.CheckInRequest;
import com.evrental.booking.dto.CheckOutRequest;
import com.evrental.booking.dto.CreateBookingRequest;
import com.evrental.booking.model.Booking;
import com.evrental.booking.service.IBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
// import java.security.Principal; // (Sẽ dùng khi tích hợp bảo mật)

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final IBookingService bookingService;

    @GetMapping("/ping")
    public String ping() {
        return "Booking-Service is alive!";
    }

    // === API 1: Renter Đặt xe (1.b) ===
    @PostMapping
    // TODO: @PreAuthorize("hasRole('RENTER')")
    public ResponseEntity<Booking> createBooking(
            @RequestBody CreateBookingRequest request) {
        
        // (Tạm thời chúng ta lấy userId từ request)
        // (Khi có bảo mật: Long userId = ((User) principal).getId();)
        
        Booking newBooking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newBooking);
    }

    // === API 2: Staff Giao xe (1.c / 2.a) ===
    @PostMapping("/{bookingId}/check-in")
    // TODO: @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Booking> checkIn(
            @PathVariable Long bookingId,
            @RequestBody CheckInRequest request) {
        
        Booking activeBooking = bookingService.checkIn(bookingId, request);
        return ResponseEntity.ok(activeBooking);
    }

    // === API 3: Staff Nhận xe (1.d / 2.a) ===
    @PostMapping("/{bookingId}/check-out")
    // TODO: @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Booking> checkOut(
            @PathVariable Long bookingId,
            @RequestBody CheckOutRequest request) {
        
        Booking completedBooking = bookingService.checkOut(bookingId, request);
        return ResponseEntity.ok(completedBooking);
    }

    // === API 4: Renter Lấy lịch sử (1.e) ===
    @GetMapping("/my-history/{userId}")
    // TODO: @PreAuthorize("isAuthenticated()")
    // (Và kiểm tra principal.getName() == userId)
    public ResponseEntity<List<Booking>> getMyHistory(@PathVariable Long userId) {
        List<Booking> history = bookingService.getMyHistory(userId);
        return ResponseEntity.ok(history);
    }
}