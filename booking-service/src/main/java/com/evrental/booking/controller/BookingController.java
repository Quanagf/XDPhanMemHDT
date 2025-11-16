package com.evrental.booking.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping; // <-- IMPORT MỚI
import org.springframework.web.bind.annotation.PathVariable; // <-- IMPORT MỚI
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping; // <-- IMPORT MỚI
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evrental.booking.dto.CheckInRequest;
import com.evrental.booking.dto.CheckOutRequest;
import com.evrental.booking.dto.CreateBookingRequest;
import com.evrental.booking.model.Booking;
import com.evrental.booking.service.IBookingService;
import com.evrental.booking.service.JwtService;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final IBookingService bookingService;
    private final JwtService jwtService; // <-- INJECT MỚI


    @GetMapping("/ping")
    public String ping() {
        return "Booking-Service is alive!";
    }
    
    // === Hàm helper (lấy Token từ header) ===
    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }



    // === API 1: Renter Đặt xe (1.b) ===
    @PostMapping
    @PreAuthorize("hasRole('RENTER')") 
    public ResponseEntity<Booking> createBooking(
            @RequestBody CreateBookingRequest request,
            @RequestHeader("Authorization") String authorizationHeader // <-- Lấy Token
    ) {
        
        // Lấy userId từ Token (Bảo mật)
        String token = extractToken(authorizationHeader);
        Long userId = jwtService.extractClaim(token, (Claims c) -> c.get("userId", Long.class));

        Booking newBooking = bookingService.createBooking(request, userId); // <-- Truyền userId bảo mật
        return ResponseEntity.status(HttpStatus.CREATED).body(newBooking);
    }

    // === API 2: Staff Giao xe (1.c / 2.a) ===
    @PostMapping("/{bookingId}/check-in")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // <-- KHÓA API
    public ResponseEntity<Booking> checkIn(
            @PathVariable Long bookingId,
            @RequestBody CheckInRequest request) {
        
        Booking activeBooking = bookingService.checkIn(bookingId, request);
        return ResponseEntity.ok(activeBooking);
    }

    // === API 3: Staff Nhận xe (1.d / 2.a) ===
    @PostMapping("/{bookingId}/check-out")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // <-- KHÓA API
    public ResponseEntity<Booking> checkOut(
            @PathVariable Long bookingId,
            @RequestBody CheckOutRequest request) {
        
        Booking completedBooking = bookingService.checkOut(bookingId, request);
        return ResponseEntity.ok(completedBooking);
    }

    // === API 4: Renter Lấy lịch sử (1.e) ===
    @GetMapping("/my-history") // <-- Xóa {userId} khỏi URL
    @PreAuthorize("hasRole('RENTER')") // <-- KHÓA API
    public ResponseEntity<List<Booking>> getMyHistory(
            @RequestHeader("Authorization") String authorizationHeader // <-- Lấy Token
    ) {
        // Lấy userId từ Token (Bảo mật)
        String token = extractToken(authorizationHeader);
        Long userId = jwtService.extractClaim(token, (Claims c) -> c.get("userId", Long.class));
        
        List<Booking> history = bookingService.getBookingsByUserId(userId); // Sửa tên hàm
        return ResponseEntity.ok(history);
    }
    
    // === API 5: Admin/Staff xem lịch sử của BẤT KỲ ai ===
    @GetMapping("/history/user/{userId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // <-- KHÓA API (Staff/Admin)
    public ResponseEntity<List<Booking>> getUserHistoryForStaff(
            @PathVariable Long userId) {

        List<Booking> history = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(history);
    }

    // === API 6: Staff Xem các booking tại trạm (2.a) ===
    @GetMapping("/station/{stationId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // <-- KHÓA API
    public ResponseEntity<List<Booking>> getStationBookings(
            @PathVariable Long stationId) {
        
        List<Booking> bookings = bookingService.getStationBookings(stationId);
        return ResponseEntity.ok(bookings);
    }
    
    // === API 7: Kiểm tra xe đã được booking (Public - cho tìm kiếm) ===
    @GetMapping("/check-availability")
    public ResponseEntity<List<Long>> checkAvailability(
            @RequestParam String startTime,
            @RequestParam String endTime) {
        
        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);
        
        List<Long> bookedVehicleIds = bookingService.getBookedVehicleIds(start, end);
        return ResponseEntity.ok(bookedVehicleIds);
    }
}

