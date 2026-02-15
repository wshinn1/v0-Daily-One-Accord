-- Fix Wes Shinn's role from 'member' to 'lead_admin'
-- This user was invited as lead_admin but the role wasn't properly set during signup

-- First, let's see the current state
SELECT 
  id,
  email,
  full_name,
  role,
  church_tenant_id,
  is_super_admin,
  created_at
FROM users
WHERE email = 'wes@wesshinn.com';

-- Update the role to lead_admin
UPDATE users
SET 
  role = 'lead_admin',
  updated_at = NOW()
WHERE email = 'wes@wesshinn.com'
  AND church_tenant_id = '00000000-0000-0000-0000-000000000001';

-- Verify the update
SELECT 
  id,
  email,
  full_name,
  role,
  church_tenant_id,
  is_super_admin,
  updated_at
FROM users
WHERE email = 'wes@wesshinn.com';

-- Also check the invitation status
SELECT 
  id,
  email,
  role,
  status,
  invited_by,
  created_at,
  accepted_at,
  expires_at
FROM user_invitations
WHERE email = 'wes@wesshinn.com'
  AND church_tenant_id = '00000000-0000-0000-0000-000000000001';

-- Update invitation status to 'accepted' if it's still 'pending'
UPDATE user_invitations
SET 
  status = 'accepted',
  accepted_at = NOW()
WHERE email = 'wes@wesshinn.com'
  AND church_tenant_id = '00000000-0000-0000-0000-000000000001'
  AND status = 'pending';
