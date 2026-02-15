-- Check your super admin status
-- Replace 'your-email@example.com' with your actual email

SELECT 
  id,
  email,
  full_name,
  is_super_admin,
  role,
  church_tenant_id
FROM public.users
WHERE email = 'your-email@example.com';

-- If is_super_admin is FALSE or NULL, uncomment and run this:
-- UPDATE public.users 
-- SET is_super_admin = true, role = 'super_admin'
-- WHERE email = 'your-email@example.com';
