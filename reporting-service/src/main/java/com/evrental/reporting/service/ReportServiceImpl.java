package com.evrental.reporting.service;

import com.evrental.reporting.dto.RevenueByStationDTO;
import com.evrental.reporting.model.BookingData;
import com.evrental.reporting.repository.BookingDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements IReportService {

    private final BookingDataRepository bookingDataRepository;
    // (Trong tương lai, bạn cũng inject các repository khác)

    @Override
    public List<RevenueByStationDTO> getRevenueReport() {
        return bookingDataRepository.getRevenueByStation();
    }

    @Override
    public List<BookingData> getUserHistory(Long userId) {
        // Service này cung cấp lại Lịch sử
        // (Tốt hơn là gọi API của booking-service, 
        // nhưng làm cách này cũng được)
        return bookingDataRepository.findByUserIdOrderByActualStartTimeDesc(userId);
    }
}