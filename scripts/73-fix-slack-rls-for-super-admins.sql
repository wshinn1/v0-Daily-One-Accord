-- Fix RLS policies for Slack tables to work with actual role names
-- and allow super admins to manage any tenant's Slack configuration

-- Update the is_admin_or_owner function to check for correct roles
CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT role::TEXT IN ('lead_admin', 'admin_staff', 'super_admin') FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Fix Slack Workspaces policies to allow super admins
DROP POLICY IF EXISTS "Admins can manage Slack workspaces in their church" ON slack_workspaces;
CREATE POLICY "Admins can manage Slack workspaces in their church"
  ON slack_workspaces FOR ALL
  USING (
    is_super_admin() 
    OR (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner())
  )
  WITH CHECK (
    is_super_admin() 
    OR (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner())
  );

-- Fix Slack Bot Configs policies to allow super admins
DROP POLICY IF EXISTS "Admins can manage Slack bot configs in their church" ON slack_bot_configs;
CREATE POLICY "Admins can manage Slack bot configs in their church"
  ON slack_bot_configs FOR ALL
  USING (
    is_super_admin() 
    OR (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner())
  )
  WITH CHECK (
    is_super_admin() 
    OR (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner())
  );

-- Fix Slack Integrations policies to allow super admins
DROP POLICY IF EXISTS "Admins can manage Slack integrations in their church" ON slack_integrations;
CREATE POLICY "Admins can manage Slack integrations in their church"
  ON slack_integrations FOR ALL
  USING (
    is_super_admin() 
    OR (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner())
  )
  WITH CHECK (
    is_super_admin() 
    OR (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner())
  );

-- Fix Slack Attendance Form Fields policies to allow super admins
DROP POLICY IF EXISTS "Admins can manage Slack attendance fields in their church" ON slack_attendance_form_fields;
CREATE POLICY "Admins can manage Slack attendance fields in their church"
  ON slack_attendance_form_fields FOR ALL
  USING (
    is_super_admin() 
    OR (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner())
  )
  WITH CHECK (
    is_super_admin() 
    OR (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner())
  );
