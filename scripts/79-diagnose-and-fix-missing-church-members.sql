-- Diagnostic script to find and fix users missing from church_members table
-- This helps identify why new signups aren't appearing in user management

-- Step 1: Find users who don't have church_members records
DO $$
DECLARE
  missing_count integer;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM users u
  WHERE NOT EXISTS (
    SELECT 1 FROM church_members cm 
    WHERE cm.user_id = u.id AND cm.church_tenant_id = u.church_tenant_id
  )
  AND u.church_tenant_id IS NOT NULL
  AND u.is_super_admin = false;
  
  RAISE NOTICE 'Found % users missing from church_members table', missing_count;
END $$;

-- Step 2: Show the missing users
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.church_tenant_id,
  u.role,
  u.created_at,
  ct.name as church_name
FROM users u
LEFT JOIN church_tenants ct ON ct.id = u.church_tenant_id
WHERE NOT EXISTS (
  SELECT 1 FROM church_members cm 
  WHERE cm.user_id = u.id AND cm.church_tenant_id = u.church_tenant_id
)
AND u.church_tenant_id IS NOT NULL
AND u.is_super_admin = false
ORDER BY u.created_at DESC;

-- Step 3: Create missing church_members records
-- Removed is_active column to match actual table schema
INSERT INTO church_members (
  user_id,
  church_tenant_id,
  role,
  joined_at
)
SELECT 
  u.id,
  u.church_tenant_id,
  u.role,
  u.created_at
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM church_members cm 
  WHERE cm.user_id = u.id AND cm.church_tenant_id = u.church_tenant_id
)
AND u.church_tenant_id IS NOT NULL
AND u.is_super_admin = false
ON CONFLICT (user_id, church_tenant_id) DO NOTHING;

-- Step 4: Verify the fix
DO $$
DECLARE
  total_users integer;
  total_members integer;
  missing_count integer;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users WHERE is_super_admin = false AND church_tenant_id IS NOT NULL;
  SELECT COUNT(DISTINCT user_id) INTO total_members FROM church_members;
  
  SELECT COUNT(*) INTO missing_count
  FROM users u
  WHERE NOT EXISTS (
    SELECT 1 FROM church_members cm 
    WHERE cm.user_id = u.id AND cm.church_tenant_id = u.church_tenant_id
  )
  AND u.church_tenant_id IS NOT NULL
  AND u.is_super_admin = false;
  
  RAISE NOTICE 'Total users: %, Total church members: %, Still missing: %', 
    total_users, total_members, missing_count;
    
  IF missing_count = 0 THEN
    RAISE NOTICE '✓ All users now have church_members records!';
  ELSE
    RAISE WARNING '⚠ Still have % users without church_members records', missing_count;
  END IF;
END $$;
