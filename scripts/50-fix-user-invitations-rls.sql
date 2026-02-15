-- Fix RLS policies for user_invitations table to allow super admin access

-- First, let's see what policies currently exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_invitations'
ORDER BY policyname;

-- Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Admins can manage invitations" ON user_invitations;
DROP POLICY IF EXISTS "Users can view their own invitations" ON user_invitations;

-- Create comprehensive policies that include super admin access
CREATE POLICY "Super admins and admins can manage invitations"
ON user_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.is_super_admin = true
      OR EXISTS (
        SELECT 1 FROM church_members
        WHERE church_members.user_id = auth.uid()
        AND church_members.church_tenant_id = user_invitations.church_tenant_id
        AND church_members.role IN ('lead_admin', 'admin')
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.is_super_admin = true
      OR EXISTS (
        SELECT 1 FROM church_members
        WHERE church_members.user_id = auth.uid()
        AND church_members.church_tenant_id = user_invitations.church_tenant_id
        AND church_members.role IN ('lead_admin', 'admin')
      )
    )
  )
);

CREATE POLICY "Users can view their own invitations"
ON user_invitations
FOR SELECT
USING (email = (SELECT email FROM users WHERE id = auth.uid()));

SELECT 'RLS policies updated for user_invitations table' as result;
