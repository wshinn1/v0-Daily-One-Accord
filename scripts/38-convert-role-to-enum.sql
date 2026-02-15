-- ============================================
-- Script 38: Convert role column to enum type
-- ============================================

-- Step 1: Update any invalid role values to 'member'
UPDATE users 
SET role = 'member' 
WHERE role IS NULL 
   OR role NOT IN ('super_admin', 'lead_admin', 'admin_staff', 'volunteer', 'member');

-- Step 2: Convert the role column from VARCHAR to user_role enum
ALTER TABLE users 
ALTER COLUMN role TYPE user_role 
USING role::user_role;

-- Step 3: Set default value
ALTER TABLE users 
ALTER COLUMN role SET DEFAULT 'member'::user_role;

-- Step 4: Make it NOT NULL
ALTER TABLE users 
ALTER COLUMN role SET NOT NULL;

-- Verify the change
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';
