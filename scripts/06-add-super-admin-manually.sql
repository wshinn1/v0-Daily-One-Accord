-- Manually add super admin user for weshinn@gmail.com
-- This script finds your auth user ID and creates the corresponding user record

-- Insert the user record for the existing auth user
INSERT INTO public.users (id, email, full_name, role, church_tenant_id, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Wesley Shinn') as full_name,
  'super_admin' as role,
  NULL as church_tenant_id,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email = 'weshinn@gmail.com'
ON CONFLICT (id) DO NOTHING;
