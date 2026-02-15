-- ============================================
-- Script 39: Add role column to public.users
-- ============================================

-- First, let's see what columns exist in public.users specifically
SELECT 
  column_name, 
  data_type,
  table_schema
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Add role column to public.users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN role user_role NOT NULL DEFAULT 'member';
    
    RAISE NOTICE 'Column role added to public.users';
  ELSE
    RAISE NOTICE 'Column role already exists in public.users';
  END IF;
END $$;

-- Add is_super_admin if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
    
    RAISE NOTICE 'Column is_super_admin added to public.users';
  ELSE
    RAISE NOTICE 'Column is_super_admin already exists in public.users';
  END IF;
END $$;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type,
  table_schema
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('role', 'is_super_admin')
ORDER BY column_name;
