-- ============================================
-- Script 36: Diagnose and Fix Users Table
-- This script shows what columns exist and adds missing ones
-- ============================================

-- Show current columns in users table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Try to add role column with explicit error handling
DO $$ 
BEGIN
  -- Add role column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'member';
    RAISE NOTICE 'Added role column';
  ELSE
    RAISE NOTICE 'Role column already exists';
  END IF;

  -- Add phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    RAISE NOTICE 'Added phone column';
  ELSE
    RAISE NOTICE 'Phone column already exists';
  END IF;

  -- Add notification_settings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'notification_settings'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_settings JSONB DEFAULT '{"email": true, "sms": false}'::jsonb;
    RAISE NOTICE 'Added notification_settings column';
  ELSE
    RAISE NOTICE 'Notification_settings column already exists';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Verify columns were added
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('role', 'phone', 'notification_settings')
ORDER BY column_name;
