package com.evrental.booking.service;

import com.evrental.booking.dto.CheckInRequest;
import com.evrental.booking.dto.CheckOutRequest;
import com.evrental.booking.dto.CreateBookingRequest;
import com.evrental.booking.model.Booking;

import java.util.List;

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
}