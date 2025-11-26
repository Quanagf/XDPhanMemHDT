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

import com.evrental.booking.dto.BookingResponseDTO;
import com.evrental.booking.dto.CheckInRequest;
import com.evrental.booking.dto.CheckOutRequest;
import com.evrental.booking.dto.CreateBookingRequest;
import com.evrental.booking.model.Booking;
import com.evrental.booking.service.IBookingService;
import com.evrental.booking.service.BookingTimeoutService;
import com.evrental.booking.service.JwtService;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final IBookingService bookingService;
    private final JwtService jwtService; // <-- INJECT MỚI
    private final BookingTimeoutService bookingTimeoutService;


    @GetMapping("/ping")
    public String ping() {
        return "Booking-Service is alive!";
    }
    
    // === TEST ENDPOINT (Không cần authentication) ===
    @PostMapping("/test")
    public ResponseEntity<Booking> createBookingTest(@RequestBody CreateBookingRequest request) {
        // Test với userId cố định = 1
        Booking newBooking = bookingService.createBooking(request, 1L);
        return ResponseEntity.status(HttpStatus.CREATED).body(newBooking);
    }
    
    // === Hàm helper (lấy Token từ header) ===
    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }



    // === API 1: Renter Đặt xe (1.b) - TẠM BỎ @PreAuthorize để test ===
    @PostMapping
    // @PreAuthorize("hasRole('RENTER')") // Tạm comment để test
    public ResponseEntity<?> createBooking(
            @RequestBody CreateBookingRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader // <-- Không bắt buộc để test
    ) {
        
        // Nếu có token thì dùng, không có thì dùng userId = 1 để test
        Long userId = 1L; // Default cho test
        if (authorizationHeader != null) {
            String token = extractToken(authorizationHeader);
            if (token != null) {
                try {
                    userId = jwtService.extractClaim(token, (Claims c) -> c.get("userId", Long.class));
                } catch (Exception e) {
                    // Nếu token lỗi thì vẫn dùng userId = 1
                    userId = 1L;
                }
            }
        }

        try {
            System.out.println("DEBUG: Received booking request: " + request);
            System.out.println("DEBUG: Using userId: " + userId);
            
            Booking newBooking = bookingService.createBooking(request, userId); // <-- Truyền userId
            System.out.println("DEBUG: Created booking: " + newBooking);
            return ResponseEntity.status(HttpStatus.CREATED).body(newBooking);
        } catch (Exception e) {
            System.err.println("ERROR creating booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
        }
    }

    // === API 2: Staff Giao xe (1.c / 2.a) ===
    @PostMapping("/{bookingId}/check-in")
    // @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // Tạm bỏ để test
    public ResponseEntity<Booking> checkIn(
            @PathVariable Long bookingId,
            @RequestBody CheckInRequest request) {
        
        Booking activeBooking = bookingService.checkIn(bookingId, request);
        return ResponseEntity.ok(activeBooking);
    }

    // === API 3: Staff Nhận xe (1.d / 2.a) ===
    @PostMapping("/{bookingId}/check-out")
    // @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // Tạm bỏ để test  
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
    
    // === API 4.1: Renter Lấy lịch sử với thông tin đầy đủ ===
    @GetMapping("/my-history/details")
    @PreAuthorize("hasRole('RENTER')")
    public ResponseEntity<List<BookingResponseDTO>> getMyHistoryWithDetails(
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        String token = extractToken(authorizationHeader);
        Long userId = jwtService.extractClaim(token, (Claims c) -> c.get("userId", Long.class));
        
        List<BookingResponseDTO> history = bookingService.getUserBookingsWithDetails(userId);
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
    // @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // Tạm bỏ để test
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
    
    // === API 8: Lấy booking đang chờ xử lý tại trạm cho staff ===
    @GetMapping("/station/{stationId}/pending")
    // @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // Tạm bỏ để test
    public ResponseEntity<List<Booking>> getPendingBookingsByStation(
            @PathVariable Long stationId) {
        
        List<Booking> pendingBookings = bookingService.getPendingBookingsByStation(stationId);
        return ResponseEntity.ok(pendingBookings);
    }
    
    // === API 9: Lấy booking đang chờ xử lý với thông tin chi tiết (user + vehicle) ===
    @GetMapping("/station/{stationId}/pending-detailed")
    // @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // Tạm bỏ để test
    public ResponseEntity<List<BookingResponseDTO>> getPendingBookingsWithDetailsForStation(
            @PathVariable Long stationId) {
        
        List<BookingResponseDTO> pendingBookings = bookingService.getPendingBookingsWithDetailsForStation(stationId);
        return ResponseEntity.ok(pendingBookings);
    }
    
    // === API 10: Lấy booking ACTIVE cần nhận xe với thông tin chi tiết ===
    @GetMapping("/station/{stationId}/active-detailed")
    // @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // Tạm bỏ để test
    public ResponseEntity<List<BookingResponseDTO>> getActiveBookingsWithDetailsForStation(
            @PathVariable Long stationId) {
        
        List<BookingResponseDTO> activeBookings = bookingService.getActiveBookingsWithDetailsForStation(stationId);
        return ResponseEntity.ok(activeBookings);
    }
    
    // === API 11: Lấy thông tin countdown cho booking ===
    @GetMapping("/{bookingId}/countdown")
    public ResponseEntity<?> getBookingCountdown(@PathVariable Long bookingId) {
        try {
            BookingTimeoutService.BookingCountdownDTO countdown = bookingTimeoutService.getBookingCountdown(bookingId);
            if (countdown == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(countdown);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting countdown: " + e.getMessage());
        }
    }
    
    // === API 12: Staff xác nhận booking ===
    @PostMapping("/{bookingId}/confirm")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> confirmBooking(@PathVariable Long bookingId) {
        try {
            Booking confirmedBooking = bookingService.confirmBooking(bookingId);
            return ResponseEntity.ok(confirmedBooking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }
    
    // === API 13: Staff từ chối booking ===
    @PostMapping("/{bookingId}/reject")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String reason) {
        try {
            Booking rejectedBooking = bookingService.rejectBooking(bookingId, reason);
            return ResponseEntity.ok(rejectedBooking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }

    // === API 14: Staff tạo booking walk-in tại điểm ===
    @PostMapping("/walk-in")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> createWalkInBooking(
            @RequestParam Long vehicleId,
            @RequestParam Long stationId,
            @RequestParam String fullName,
            @RequestParam String phoneNumber,
            @RequestParam(required = false) String email,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile gplxImage,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile cccdImage,
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        try {
            // Extract staff userId from token
            String token = extractToken(authorizationHeader);
            Long staffId = jwtService.extractClaim(token, (Claims c) -> c.get("userId", Long.class));

            // Parse dates - Handle both ISO format and datetime-local format
            LocalDateTime start;
            LocalDateTime end;
            try {
                start = LocalDateTime.parse(startDate);
                end = LocalDateTime.parse(endDate);
            } catch (Exception e) {
                // Try parsing as date-time without seconds
                java.time.format.DateTimeFormatter formatter = 
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
                start = LocalDateTime.parse(startDate, formatter);
                end = LocalDateTime.parse(endDate, formatter);
            }

            // Create walk-in booking through service
            Booking walkInBooking = bookingService.createWalkInBooking(
                vehicleId, 
                stationId, 
                staffId,
                fullName, 
                phoneNumber, 
                email,
                start, 
                end, 
                gplxImage, 
                cccdImage
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(walkInBooking);
        } catch (Exception e) {
            System.err.println("ERROR creating walk-in booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }
}


