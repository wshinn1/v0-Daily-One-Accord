-- Add phone field to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'phone';
