-- ============================================
-- PART 1: ENUM TYPES ONLY
-- Run this FIRST, then wait for it to complete
-- ============================================

-- Drop existing enum types with CASCADE
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS visitor_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;

-- Create enum types with ALL values
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'lead_admin', 
  'admin_staff',
  'volunteer',
  'member'
);

CREATE TYPE visitor_status AS ENUM (
  'new',
  'contacted',
  'returning',
  'member'
);

CREATE TYPE attendance_status AS ENUM (
  'present',
  'absent',
  'excused'
);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Part 1 complete! Now run SETUP-PART-2-TABLES.sql';
END $$;
