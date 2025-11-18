-- Migration: Add STAFF_COMPLETED to complaints status ENUM
-- Date: 2025-11-18

USE userdb;

-- Modify the status column to include STAFF_COMPLETED
ALTER TABLE complaints 
MODIFY COLUMN status ENUM('PENDING', 'IN_PROGRESS', 'STAFF_COMPLETED', 'RESOLVED', 'REJECTED') 
DEFAULT 'PENDING' 
NOT NULL;

-- Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'userdb' 
  AND TABLE_NAME = 'complaints' 
  AND COLUMN_NAME = 'status';
