-- Drop the existing restrictive INSERT policy on users table
DROP POLICY IF EXISTS "Admins can insert users in their tenant" ON users;

-- Create a new policy that allows users to insert their own profile during signup
CREATE POLICY "Users can create their own profile during signup"
  ON users FOR INSERT
  WITH CHECK (
    -- Allow if the user is creating their own profile (id matches auth.uid())
    id = auth.uid() OR
    -- OR if they're a super admin
    is_super_admin() OR 
    -- OR if they're an admin/pastor/elder in the same tenant
    (church_tenant_id = get_user_church_tenant_id() AND 
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );
