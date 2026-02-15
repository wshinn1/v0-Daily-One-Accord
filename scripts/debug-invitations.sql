-- Debug script to check invitations in the database
-- This will show all invitations for the Dream Church tenant

SELECT 
  id,
  email,
  church_tenant_id,
  role,
  status,
  accepted_at,
  created_at,
  invited_by
FROM user_invitations
WHERE church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187'
ORDER BY created_at DESC;

-- Also check the church_tenants table to verify the tenant ID
SELECT id, name, church_code
FROM church_tenants
WHERE id = 'caebe310-165b-48c6-912d-2088e5d60187';

-- Check if there are any invitations at all
SELECT COUNT(*) as total_invitations
FROM user_invitations;
