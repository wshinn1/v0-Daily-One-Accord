-- Update Slack integrations RLS policies to allow super admins

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view slack integrations in their tenant" ON slack_integrations;
DROP POLICY IF EXISTS "Admins can manage slack integrations in their tenant" ON slack_integrations;

-- Recreate policies with super admin support
CREATE POLICY "Admins can view slack integrations in their tenant"
  ON slack_integrations FOR SELECT
  USING (
    is_super_admin() OR 
    church_tenant_id = get_user_church_tenant_id()
  );

CREATE POLICY "Admins can manage slack integrations in their tenant"
  ON slack_integrations FOR ALL
  USING (
    is_super_admin() OR 
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );
