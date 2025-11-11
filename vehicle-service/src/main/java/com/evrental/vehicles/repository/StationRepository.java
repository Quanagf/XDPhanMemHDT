package com.evrental.vehicles.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.evrental.vehicles.model.Station;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    
    // Tìm các trạm theo tỉnh/thành phố
    List<Station> findByProvince(String province);
    
    // Tìm các trạm đang hoạt động
    List<Station> findByIsActiveTrue();
    
    // Tìm các trạm theo tỉnh và trạng thái
    List<Station> findByProvinceAndIsActive(String province, Boolean isActive);
    
    // Tìm các trạm theo tên (tìm kiếm gần đúng)
    List<Station> findByNameContainingIgnoreCase(String name);

    /**
     * Đếm số trạm dựa trên trạng thái active (true hoặc false).
     * Đây là một JPA Derived Query, Spring Data sẽ tự động hiểu.
     */
    long countByIsActive(boolean isActive);

    /**
     * Tính tổng sức chứa (capacity) của tất cả các trạm trong hệ thống.
     * Chúng ta dùng @Query vì đây là một hàm tổng hợp (SUM).
     * Lưu ý: Trả về Long (object) để xử lý trường hợp không có trạm nào (tránh lỗi).
     */
    @Query("SELECT SUM(s.capacity) FROM Station s")
    Long getTotalCapacity();

    /**
     * Lấy danh sách số lượng trạm, gom nhóm theo tỉnh (province).
     * Kết quả trả về là một List<Object[]>, với mỗi Object[] là [String province, Long count]
     * Ví dụ: [ ["Hà Nội", 10], ["Đà Nẵng", 5] ]
     */
    @Query("SELECT s.province, COUNT(s) FROM Station s GROUP BY s.province")
    List<Object[]> countStationsByProvince();
}
