-- Fix the is_super_admin field for weshinn@gmail.com
UPDATE users 
SET is_super_admin = true 
WHERE email = 'weshinn@gmail.com';

-- Drop the old users SELECT policy
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;

-- Create a new policy that allows users to read their own record
CREATE POLICY "Users can view their own record and users in their tenant"
  ON users FOR SELECT
  USING (
    id = auth.uid() OR  -- Users can always read their own record
    is_super_admin() OR 
    church_tenant_id = get_user_church_tenant_id()
  );
