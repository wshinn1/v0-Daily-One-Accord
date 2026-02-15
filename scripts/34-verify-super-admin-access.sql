-- ============================================
-- Script: 34-verify-super-admin-access.sql
-- Verifies super admin status and RLS policies
-- ⚠️  REMINDER: Run this in production Supabase!
-- ============================================

-- Check your super admin status
-- Replace 'your-email@example.com' with your actual email
SELECT 
  id,
  email,
  full_name,
  is_super_admin,
  church_tenant_id,
  role
FROM users 
WHERE email = 'your-email@example.com';

-- If is_super_admin is FALSE or NULL, run this to make yourself a super admin:
-- UPDATE users SET is_super_admin = TRUE WHERE email = 'your-email@example.com';

-- Verify you can see all church tenants
SELECT id, name, church_code, created_at 
FROM church_tenants 
ORDER BY created_at DESC;

-- Check RLS policies on church_tenants table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'church_tenants';
