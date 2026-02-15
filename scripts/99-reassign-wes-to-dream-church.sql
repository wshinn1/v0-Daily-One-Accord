-- Step 1: Find Dream Church tenant ID
WITH dream_church AS (
  SELECT id, name
  FROM church_tenants
  WHERE name ILIKE '%dream%'
  LIMIT 1
)
-- Step 2: Update wes@wesshinn.com to Dream Church
UPDATE users
SET 
  church_tenant_id = (SELECT id FROM dream_church),
  updated_at = NOW()
WHERE email = 'wes@wesshinn.com'
RETURNING 
  id,
  email,
  full_name,
  role,
  church_tenant_id,
  (SELECT name FROM dream_church) as new_church_name,
  'Successfully reassigned to Dream Church! ✅' as status;
