-- ============================================
-- Script 35: Add Missing User Columns
-- Purpose: Ensures all required columns exist in users table
-- ⚠️  REMINDER: Run this in production Supabase!
-- ============================================

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'member';
    RAISE NOTICE 'Added role column to users table';
  ELSE
    RAISE NOTICE 'role column already exists';
  END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    RAISE NOTICE 'Added phone column to users table';
  ELSE
    RAISE NOTICE 'phone column already exists';
  END IF;
END $$;

-- Add notification_settings column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'notification_settings'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_settings JSONB DEFAULT '{"email": true, "slack": true}'::jsonb;
    RAISE NOTICE 'Added notification_settings column to users table';
  ELSE
    RAISE NOTICE 'notification_settings column already exists';
  END IF;
END $$;

-- Verify all columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
