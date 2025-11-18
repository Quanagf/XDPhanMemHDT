-- Thêm các trường thông số kỹ thuật cho bảng vehicles
USE vehicle_db;

ALTER TABLE vehicles
ADD COLUMN seats INT COMMENT 'Số ghế',
ADD COLUMN battery_capacity DOUBLE COMMENT 'Dung lượng pin (kWh)',
ADD COLUMN `range` INT COMMENT 'Phạm vi di chuyển (km)',
ADD COLUMN charging_type VARCHAR(50) COMMENT 'Loại cổng sạc',
ADD COLUMN charging_speed VARCHAR(100) COMMENT 'Tốc độ sạc',
ADD COLUMN location VARCHAR(255) COMMENT 'Vị trí hiện tại',
ADD COLUMN trip_count INT DEFAULT 0 COMMENT 'Số chuyến đã thực hiện',
ADD COLUMN technical_condition VARCHAR(50) COMMENT 'Tình trạng kỹ thuật (excellent, good, fair, poor)',
ADD COLUMN maintenance_notes TEXT COMMENT 'Ghi chú bảo trì';
