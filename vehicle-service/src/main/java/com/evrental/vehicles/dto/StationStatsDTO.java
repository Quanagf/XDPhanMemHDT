package com.evrental.vehicles.dto;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationStatsDTO {
    
    private long totalStations;      // Tổng số trạm
    private long activeStations;     // Số trạm đang hoạt động
    private long inactiveStations;   // Số trạm không hoạt động
    private long totalCapacity;      // Tổng sức chứa (tổng số xe có thể đỗ)
    
    // Thống kê nâng cao: Số lượng trạm theo từng tỉnh
    // Ví dụ: {"Hà Nội": 10, "TP.HCM": 15}
    private Map<String, Long> stationsByProvince; 
}
