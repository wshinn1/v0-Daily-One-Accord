-- Add phone number field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

SELECT 'Phone field added to users table' AS result;
