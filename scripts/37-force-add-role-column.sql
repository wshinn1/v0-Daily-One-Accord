-- ============================================
-- Script 37: Force Add Role Column to Users Table
-- This script explicitly adds the role column with detailed error handling
-- ============================================

-- First, verify the user_role enum exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        RAISE EXCEPTION 'user_role enum type does not exist! Run SETUP-PART-1-ENUMS.sql first.';
    ELSE
        RAISE NOTICE 'user_role enum type exists ✓';
    END IF;
END $$;

-- Show current columns before adding
SELECT 'BEFORE: Current columns in users table:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Add the role column
DO $$
BEGIN
    -- Check if role column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        -- Add the role column
        ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'member';
        RAISE NOTICE 'role column added successfully ✓';
    ELSE
        RAISE NOTICE 'role column already exists ✓';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to add role column: %', SQLERRM;
END $$;

-- Show current columns after adding
SELECT 'AFTER: Current columns in users table:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verify the role column exists and show sample data
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        RAISE NOTICE '✓ SUCCESS: role column now exists in users table';
    ELSE
        RAISE EXCEPTION '✗ FAILED: role column still does not exist';
    END IF;
END $$;
