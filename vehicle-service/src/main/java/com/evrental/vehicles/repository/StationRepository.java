package com.evrental.vehicles.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.model.Station.StationStatus;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    
    // Tìm các trạm theo tỉnh/thành phố
    List<Station> findByProvince(String province);
    
    // Tìm các trạm theo trạng thái
    List<Station> findByStatus(StationStatus status);
    
    // Tìm các trạm theo tỉnh và trạng thái
    List<Station> findByProvinceAndStatus(String province, StationStatus status);
    
    // Tìm các trạm theo tên (tìm kiếm gần đúng)
    List<Station> findByNameContainingIgnoreCase(String name);

    /**
     * Đếm số trạm dựa trên trạng thái (OPEN, CLOSED, TEMPORARILY_UNAVAILABLE).
     */
    long countByStatus(StationStatus status);

    /**
     * Tính tổng sức chứa (capacity) của tất cả các trạm trong hệ thống.
     */
    @Query("SELECT SUM(s.capacity) FROM Station s")
    Long getTotalCapacity();

    /**
     * Lấy danh sách số lượng trạm, gom nhóm theo tỉnh (province).
     * Kết quả trả về là một List<Object[]>, với mỗi Object[] là [String province, Long count]
     */
    @Query("SELECT s.province, COUNT(s) FROM Station s GROUP BY s.province")
    List<Object[]> countStationsByProvince();
}
