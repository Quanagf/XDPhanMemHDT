-- Migration: Thêm fields hủy booking
-- Date: 2025-11-26

USE booking_db;

-- Thêm cột cancellation_reason và cancelled_at vào bảng bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT COMMENT 'Lý do hủy booking',
ADD COLUMN IF NOT EXISTS cancelled_at DATETIME COMMENT 'Thời gian hủy booking';

-- Index cho cancelled_at để query nhanh
CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_at ON bookings(cancelled_at);
