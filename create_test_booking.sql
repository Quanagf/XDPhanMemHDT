-- Tạo booking test để demo tính năng xác thực khách hàng
USE booking_db;

-- Thêm booking với status PENDING để staff có thể giao xe
INSERT INTO bookings (
    user_id,
    vehicle_id, 
    start_station_id,
    end_station_id,
    estimated_start_time,
    estimated_end_time,
    actual_start_time,
    total_amount,
    payment_method,
    status,
    created_at,
    updated_at,
    checkin_vehicle_image_url,
    customer_license_image_url,
    staff_verified_customer
) VALUES (
    1,
    1,
    1,
    1,
    '2025-11-23 10:00:00',
    '2025-11-23 12:00:00', 
    NULL,
    50000,
    'MOMO',
    'PENDING',
    NOW(),
    NOW(),
    NULL,
    NULL,
    false
);

-- Kiểm tra booking đã tạo
SELECT * FROM bookings WHERE status = 'PENDING';