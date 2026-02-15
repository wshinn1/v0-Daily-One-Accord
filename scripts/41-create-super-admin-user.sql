-- ============================================
-- Script: 41-create-super-admin-user.sql
-- Description: Creates a super admin user record in public.users
-- ⚠️  REMINDER: Run this in production Supabase!
-- ============================================

-- Step 1: Check if user exists in auth.users
SELECT 
  id,
  email,
  'User found in auth.users' as status
FROM auth.users
WHERE email = 'your-email@example.com';

-- Step 2: Create user in public.users as super admin
-- Replace 'your-email@example.com' with your actual email
-- Replace 'Your Full Name' with your actual name
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  is_super_admin,
  church_tenant_id,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Your Full Name', -- CHANGE THIS to your name
  'super_admin'::user_role,
  true,
  NULL, -- Super admins don't belong to a specific church
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET
  is_super_admin = true,
  role = 'super_admin'::user_role,
  updated_at = NOW();

-- Step 3: Verify the user was created
SELECT 
  id,
  email,
  full_name,
  role,
  is_super_admin,
  church_tenant_id,
  'User successfully created/updated in public.users' as status
FROM public.users
WHERE email = 'your-email@example.com';
