package com.evrental.users.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evrental.users.model.Station;

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
}
