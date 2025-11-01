package com.evrental.reporting.service;

import com.evrental.reporting.dto.RevenueByStationDTO;
import com.evrental.reporting.model.BookingData;

import java.util.List;

public interface IReportService {

    // (3.d) Báo cáo cho Admin
    List<RevenueByStationDTO> getRevenueReport();

    // (1.e) Lịch sử/Phân tích cho Renter
    List<BookingData> getUserHistory(Long userId);
}