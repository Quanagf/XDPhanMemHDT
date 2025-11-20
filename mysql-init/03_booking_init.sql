-- Tạo database cho booking service nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng booking database
USE booking_db;

-- Tạo bảng bookings
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    start_station_id BIGINT NOT NULL,
    end_station_id BIGINT NULL,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_start_time TIMESTAMP NULL,
    estimated_end_time TIMESTAMP NULL,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    checkout_vehicle_image_url TEXT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_cost DECIMAL(10,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng booking_contracts
CREATE TABLE IF NOT EXISTS booking_contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    contract_number VARCHAR(255) NOT NULL UNIQUE,
    customer_signature_url TEXT NULL,
    staff_signature_url TEXT NULL,
    vehicle_condition_before TEXT NULL,
    vehicle_condition_after TEXT NULL,
    damage_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Tạo index cho performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_start_station_id ON bookings(start_station_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_estimated_start_time ON bookings(estimated_start_time);
CREATE INDEX idx_bookings_booking_time ON bookings(booking_time);

-- Thêm dữ liệu mẫu cho testing
INSERT IGNORE INTO bookings (id, user_id, vehicle_id, start_station_id, estimated_start_time, estimated_end_time, status, total_cost) VALUES
(1, 2, 1, 1, '2025-11-20 14:00:00', '2025-11-20 18:00:00', 'PENDING', 200000),
(2, 3, 2, 1, '2025-11-20 15:30:00', '2025-11-20 19:30:00', 'PENDING', 240000),
(3, 4, 3, 2, '2025-11-20 09:00:00', '2025-11-20 17:00:00', 'ACTIVE', 400000),
(4, 5, 4, 1, '2025-11-19 08:00:00', '2025-11-19 20:00:00', 'COMPLETED', 600000),
(5, 6, 5, 2, '2025-11-20 16:00:00', '2025-11-20 20:00:00', 'PENDING', 200000);