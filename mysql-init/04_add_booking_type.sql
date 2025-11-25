-- Thêm cột booking_type vào bảng bookings
USE booking_db;

ALTER TABLE bookings 
ADD COLUMN booking_type ENUM('ADVANCE', 'ON_SPOT') NOT NULL DEFAULT 'ADVANCE' 
AFTER total_cost;

-- Cập nhật comment cho bảng
ALTER TABLE bookings COMMENT = 'Bảng lưu thông tin đặt xe với loại đặt xe (đặt trước/đặt tại điểm)';