-- Fix RLS policies to allow super admins to manage all tenant data

-- Drop and recreate visitors policies to include super admin access
DROP POLICY IF EXISTS "Staff can manage visitors in their tenant" ON visitors;

CREATE POLICY "Staff and super admins can manage visitors"
  ON visitors FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix events policies
DROP POLICY IF EXISTS "Leaders can manage events in their tenant" ON events;

CREATE POLICY "Leaders and super admins can manage events"
  ON events FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix attendance policies
DROP POLICY IF EXISTS "Staff can manage attendance in their tenant" ON attendance;

CREATE POLICY "Staff and super admins can manage attendance"
  ON attendance FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix ministry teams policies
DROP POLICY IF EXISTS "Admins can manage ministry teams in their tenant" ON ministry_teams;

CREATE POLICY "Admins and super admins can manage ministry teams"
  ON ministry_teams FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );

-- Fix ministry team members policies
DROP POLICY IF EXISTS "Leaders can manage ministry team members" ON ministry_team_members;

CREATE POLICY "Leaders and super admins can manage ministry team members"
  ON ministry_team_members FOR ALL
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM ministry_teams mt
      JOIN users u ON u.id = auth.uid()
      WHERE mt.id = ministry_team_id 
      AND mt.church_tenant_id = u.church_tenant_id
      AND u.role IN ('admin', 'pastor', 'elder')
    )
  );

-- Fix volunteer teams policies
DROP POLICY IF EXISTS "Admins can manage volunteer teams in their tenant" ON volunteer_teams;

CREATE POLICY "Admins and super admins can manage volunteer teams"
  ON volunteer_teams FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix volunteer team members policies
DROP POLICY IF EXISTS "Staff can manage volunteer team members" ON volunteer_team_members;

CREATE POLICY "Staff and super admins can manage volunteer team members"
  ON volunteer_team_members FOR ALL
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM volunteer_teams vt
      JOIN users u ON u.id = auth.uid()
      WHERE vt.id = volunteer_team_id 
      AND vt.church_tenant_id = u.church_tenant_id
      AND u.role IN ('admin', 'pastor', 'elder', 'staff')
    )
  );

-- Fix newsletters policies
DROP POLICY IF EXISTS "Staff can manage newsletters in their tenant" ON newsletters;

CREATE POLICY "Staff and super admins can manage newsletters"
  ON newsletters FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix slack integrations policies
DROP POLICY IF EXISTS "Admins can manage slack integrations in their tenant" ON slack_integrations;

CREATE POLICY "Admins and super admins can manage slack integrations"
  ON slack_integrations FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );
