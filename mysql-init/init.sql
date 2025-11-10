CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS vehicle_db;
CREATE DATABASE IF NOT EXISTS booking_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS reporting_db;

-- Thêm các cột mới vào bảng users nếu chưa tồn tại
USE user_db;

-- Kiểm tra và thêm cột birth_date
SET @dbname = 'user_db';
SET @tablename = 'users';
SET @columnname = 'birth_date';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATE;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Kiểm tra và thêm cột gender
SET @columnname = 'gender';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10);')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Kiểm tra và thêm cột facebook
SET @columnname = 'facebook';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255);')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================================
-- Tạo bảng stations trong vehicle_db
-- ============================================================
USE vehicle_db;

-- Tạo bảng stations nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    phone_number VARCHAR(20),
    province VARCHAR(100),
    city VARCHAR(100),
    capacity INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'OPEN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu vào bảng stations
INSERT INTO stations (name, address, phone_number, province, city, capacity, status) VALUES
-- Hà Nội
('Trạm Hoàn Kiếm', '15 Đinh Tiên Hoàng, Hoàn Kiếm', '024 3825 1234', 'Hà Nội', 'Hoàn Kiếm', 50, 'OPEN'),
('Trạm Cầu Giấy', '123 Cầu Giấy, Cầu Giấy', '024 3755 6789', 'Hà Nội', 'Cầu Giấy', 40, 'OPEN'),
('Trạm Đống Đa', '456 Láng Hạ, Đống Đa', '024 3574 3456', 'Hà Nội', 'Đống Đa', 35, 'OPEN'),
('Trạm Hai Bà Trưng', '789 Bà Triệu, Hai Bà Trưng', '024 3974 5678', 'Hà Nội', 'Hai Bà Trưng', 45, 'OPEN'),

-- TP. Hồ Chí Minh
('Trạm Quận 1', '123 Nguyễn Huệ, Quận 1', '028 3822 1234', 'TP. Hồ Chí Minh', 'Quận 1', 60, 'OPEN'),
('Trạm Quận 3', '456 Nam Kỳ Khởi Nghĩa, Quận 3', '028 3930 5678', 'TP. Hồ Chí Minh', 'Quận 3', 45, 'OPEN'),
('Trạm Quận 7', '789 Nguyễn Văn Linh, Quận 7', '028 5412 9012', 'TP. Hồ Chí Minh', 'Quận 7', 55, 'OPEN'),
('Trạm Thủ Đức', '321 Võ Văn Ngân, Thủ Đức', '028 3725 3456', 'TP. Hồ Chí Minh', 'Thủ Đức', 50, 'OPEN'),

-- Đà Nẵng
('Trạm Hải Châu', '100 Trần Phú, Hải Châu', '0236 3888 234', 'Đà Nẵng', 'Hải Châu', 40, 'OPEN'),
('Trạm Sơn Trà', '200 Võ Nguyên Giáp, Sơn Trà', '0236 3999 567', 'Đà Nẵng', 'Sơn Trà', 35, 'OPEN'),
('Trạm Ngũ Hành Sơn', '300 Nguyễn Tất Thành, Ngũ Hành Sơn', '0236 3777 890', 'Đà Nẵng', 'Ngũ Hành Sơn', 30, 'OPEN'),

-- Hải Phòng
('Trạm Hồng Bàng', '50 Đinh Tiên Hoàng, Hồng Bàng', '0225 3822 345', 'Hải Phòng', 'Hồng Bàng', 35, 'OPEN'),
('Trạm Lê Chân', '150 Lê Lợi, Lê Chân', '0225 3733 678', 'Hải Phòng', 'Lê Chân', 30, 'OPEN'),

-- Cần Thơ
('Trạm Ninh Kiều', '75 Mậu Thân, Ninh Kiều', '0292 3822 456', 'Cần Thơ', 'Ninh Kiều', 40, 'OPEN'),
('Trạm Cái Răng', '200 Trần Hoàng Na, Cái Răng', '0292 3877 789', 'Cần Thơ', 'Cái Răng', 30, 'OPEN'),

-- Nha Trang
('Trạm Trung tâm Nha Trang', '25 Trần Phú, Nha Trang', '0258 3522 123', 'Khánh Hòa', 'Nha Trang', 45, 'OPEN'),
('Trạm Cam Ranh', '100 Nguyễn Tất Thành, Cam Ranh', '0258 3677 456', 'Khánh Hòa', 'Cam Ranh', 25, 'OPEN'),

-- Đà Lạt
('Trạm Trung tâm Đà Lạt', '1 Trần Phú, Đà Lạt', '0263 3822 234', 'Lâm Đồng', 'Đà Lạt', 30, 'OPEN'),

-- Vũng Tàu
('Trạm Vũng Tàu', '50 Trần Hưng Đạo, Vũng Tàu', '0254 3856 567', 'Bà Rịa - Vũng Tàu', 'Vũng Tàu', 35, 'OPEN'),

-- Huế
('Trạm Trung tâm Huế', '23 Lê Lợi, Huế', '0234 3822 345', 'Thừa Thiên Huế', 'Huế', 30, 'OPEN'),

-- Quy Nhơn
('Trạm Quy Nhơn', '100 Nguyễn Huệ, Quy Nhơn', '0256 3822 678', 'Bình Định', 'Quy Nhơn', 25, 'OPEN')
ON DUPLICATE KEY UPDATE name=name;
