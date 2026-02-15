-- Verify wes@wesshinn.com's current tenant in database
SELECT 
  id,
  email,
  full_name,
  church_tenant_id,
  role,
  is_super_admin,
  (SELECT name FROM church_tenants WHERE id = users.church_tenant_id) as current_church_name
FROM users
WHERE email = 'wes@wesshinn.com';
