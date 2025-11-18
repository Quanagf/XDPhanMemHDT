-- Thêm dữ liệu mẫu cho bảng stations
USE vehicle_db;

-- Xóa dữ liệu cũ nếu có
DELETE FROM stations WHERE id BETWEEN 1 AND 15;

-- Reset AUTO_INCREMENT
ALTER TABLE stations AUTO_INCREMENT = 1;

-- Thêm các trạm tại TP.HCM
INSERT INTO stations (name, address, phone_number, province, city, latitude, longitude, capacity, operating_hours, status) VALUES
-- Quận 1
('Trạm Bến Thành', '123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM', '0901234567', 'TP. Hồ Chí Minh', 'Quận 1', 10.77298900, 106.69803300, 50, '06:00 - 22:00', 'OPEN'),
('Trạm Nguyễn Huệ', '45 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', '0901234568', 'TP. Hồ Chí Minh', 'Quận 1', 10.77463900, 106.70331500, 40, '06:00 - 22:00', 'OPEN'),

-- Quận 3
('Trạm Cách Mạng Tháng 8', '100 Cách Mạng Tháng 8, Phường 6, Quận 3, TP.HCM', '0901234569', 'TP. Hồ Chí Minh', 'Quận 3', 10.78417800, 106.67613000, 45, '06:00 - 22:00', 'OPEN'),
('Trạm Ba Tháng Hai', '200 Ba Tháng Hai, Phường 12, Quận 10, TP.HCM', '0901234570', 'TP. Hồ Chí Minh', 'Quận 10', 10.77096300, 106.66712400, 35, '06:00 - 22:00', 'OPEN'),

-- Quận Bình Thạnh
('Trạm Xô Viết Nghệ Tĩnh', '150 Xô Viết Nghệ Tĩnh, Phường 21, Quận Bình Thạnh, TP.HCM', '0901234571', 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', 10.80693700, 106.71265200, 60, '06:00 - 22:00', 'OPEN'),
('Trạm Điện Biên Phủ', '300 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP.HCM', '0901234572', 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', 10.80080400, 106.71241800, 55, '06:00 - 22:00', 'OPEN'),

-- Quận 7
('Trạm Nguyễn Hữu Thọ', '400 Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7, TP.HCM', '0901234573', 'TP. Hồ Chí Minh', 'Quận 7', 10.73445300, 106.71930500, 70, '06:00 - 22:00', 'OPEN'),
('Trạm Phú Mỹ Hưng', '50 Nguyễn Lương Bằng, Phường Tân Phú, Quận 7, TP.HCM', '0901234574', 'TP. Hồ Chí Minh', 'Quận 7', 10.72952200, 106.71993600, 65, '06:00 - 22:00', 'OPEN'),

-- Quận Thủ Đức (TP. Thủ Đức)
('Trạm Xa Lộ Hà Nội', '500 Xa Lộ Hà Nội, Phường Linh Trung, TP. Thủ Đức, TP.HCM', '0901234575', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', 10.87093600, 106.78894400, 80, '06:00 - 22:00', 'OPEN'),
('Trạm Khu Công Nghệ Cao', '100 Đường số 1, Phường Tân Phú, TP. Thủ Đức, TP.HCM', '0901234576', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', 10.85040600, 106.76515100, 75, '06:00 - 22:00', 'OPEN'),

-- Hà Nội
('Trạm Hoàn Kiếm', '75 Hàng Bài, Quận Hoàn Kiếm, Hà Nội', '0241234567', 'Hà Nội', 'Quận Hoàn Kiếm', 21.02694900, 105.85217100, 45, '06:00 - 22:00', 'OPEN'),
('Trạm Cầu Giấy', '200 Trần Duy Hưng, Quận Cầu Giấy, Hà Nội', '0241234568', 'Hà Nội', 'Quận Cầu Giấy', 21.01774100, 105.79634700, 55, '06:00 - 22:00', 'OPEN'),

-- Đà Nẵng
('Trạm Sơn Trà', '100 Võ Nguyên Giáp, Quận Sơn Trà, Đà Nẵng', '0511234567', 'Đà Nẵng', 'Quận Sơn Trà', 16.05647800, 108.24305900, 40, '06:00 - 22:00', 'OPEN'),
('Trạm Hải Châu', '50 Lê Duẩn, Quận Hải Châu, Đà Nẵng', '0511234568', 'Đà Nẵng', 'Quận Hải Châu', 16.04776700, 108.22095600, 35, '06:00 - 22:00', 'OPEN'),

-- Cần Thơ
('Trạm Ninh Kiều', '200 Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ', '0711234567', 'Cần Thơ', 'Quận Ninh Kiều', 10.03398600, 105.78217400, 30, '06:00 - 22:00', 'OPEN');

-- Cập nhật created_at và updated_at
UPDATE stations 
SET created_at = NOW(), updated_at = NOW()
WHERE id BETWEEN 1 AND 15;
