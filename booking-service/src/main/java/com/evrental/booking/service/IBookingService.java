package com.evrental.booking.service;

import java.time.LocalDateTime;
import java.util.List;

import com.evrental.booking.dto.BookingResponseDTO;
import com.evrental.booking.dto.CheckInRequest;
import com.evrental.booking.dto.CheckOutRequest;
import com.evrental.booking.dto.CreateBookingRequest;
import com.evrental.booking.model.Booking;

public interface IBookingService {

    // 1. Renter: Đặt xe (1.b)
    Booking createBooking(CreateBookingRequest request, Long userId);

    // 2. Staff: Giao xe (1.c / 2.a)
    Booking checkIn(Long bookingId, CheckInRequest request);
    
    // 3. Staff: Nhận xe (1.d / 2.a)
    Booking checkOut(Long bookingId, CheckOutRequest request);
    
    // 4. Renter: Xem lịch sử (1.e)
    List<Booking> getMyHistory(Long userId);
    
    // 5. Staff: Xem các booking tại trạm (2.a)
    List<Booking> getStationBookings(Long stationId);

    // 6. Admin/Staff: Xem lịch sử của BẤT KỲ ai (3.a)
    List<Booking> getBookingsByUserId(Long userId);
    
    // 7. Kiểm tra xe đã được booking trong khoảng thời gian
    List<Long> getBookedVehicleIds(LocalDateTime startTime, LocalDateTime endTime);
    
    // 8. Lấy booking đang chờ xử lý tại trạm cho staff
    List<Booking> getPendingBookingsByStation(Long stationId);
    
    // 9. Lấy booking với thông tin đầy đủ (bao gồm user và vehicle info)
    List<BookingResponseDTO> getPendingBookingsWithDetailsForStation(Long stationId);
    
    // 10. Lấy booking ACTIVE cần nhận xe tại trạm 
    List<BookingResponseDTO> getActiveBookingsWithDetailsForStation(Long stationId);
}