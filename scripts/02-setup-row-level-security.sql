-- Enable Row Level Security on all tables
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_integrations ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's church tenant
CREATE OR REPLACE FUNCTION get_user_church_tenant_id()
RETURNS UUID AS $$
  SELECT church_tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_super_admin FROM users WHERE id = auth.uid()), FALSE);
$$ LANGUAGE SQL SECURITY DEFINER;

-- Church Tenants Policies
CREATE POLICY "Super admins can view all tenants"
  ON church_tenants FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Users can view their own tenant"
  ON church_tenants FOR SELECT
  USING (id = get_user_church_tenant_id());

CREATE POLICY "Super admins can insert tenants"
  ON church_tenants FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update tenants"
  ON church_tenants FOR UPDATE
  USING (is_super_admin());

-- Users Policies
CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (
    is_super_admin() OR 
    church_tenant_id = get_user_church_tenant_id()
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can insert users in their tenant"
  ON users FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    (church_tenant_id = get_user_church_tenant_id() AND 
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );

-- Visitors Policies
CREATE POLICY "Users can view visitors in their tenant"
  ON visitors FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Staff can manage visitors in their tenant"
  ON visitors FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

-- Events Policies
CREATE POLICY "Users can view events in their tenant"
  ON events FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin() OR is_public = TRUE);

CREATE POLICY "Leaders can manage events in their tenant"
  ON events FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

-- Event Registrations Policies (public can register)
CREATE POLICY "Anyone can register for public events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_public = TRUE AND allow_registration = TRUE)
  );

CREATE POLICY "Staff can view registrations for their tenant events"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND (e.church_tenant_id = get_user_church_tenant_id() OR is_super_admin())
    )
  );

-- Attendance Policies
CREATE POLICY "Users can view attendance in their tenant"
  ON attendance FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Staff can manage attendance in their tenant"
  ON attendance FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

-- Ministry Teams Policies
CREATE POLICY "Users can view ministry teams in their tenant"
  ON ministry_teams FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Admins can manage ministry teams in their tenant"
  ON ministry_teams FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder'))
  );

-- Ministry Team Members Policies
CREATE POLICY "Users can view ministry team members in their tenant"
  ON ministry_team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ministry_teams mt
      WHERE mt.id = ministry_team_id 
      AND (mt.church_tenant_id = get_user_church_tenant_id() OR is_super_admin())
    )
  );

CREATE POLICY "Leaders can manage ministry team members"
  ON ministry_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ministry_teams mt
      JOIN users u ON u.id = auth.uid()
      WHERE mt.id = ministry_team_id 
      AND mt.church_tenant_id = u.church_tenant_id
      AND u.role IN ('admin', 'pastor', 'elder')
    )
  );

-- Similar policies for volunteer teams
CREATE POLICY "Users can view volunteer teams in their tenant"
  ON volunteer_teams FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Admins can manage volunteer teams in their tenant"
  ON volunteer_teams FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

CREATE POLICY "Users can view volunteer team members in their tenant"
  ON volunteer_team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_teams vt
      WHERE vt.id = volunteer_team_id 
      AND (vt.church_tenant_id = get_user_church_tenant_id() OR is_super_admin())
    )
  );

CREATE POLICY "Staff can manage volunteer team members"
  ON volunteer_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_teams vt
      JOIN users u ON u.id = auth.uid()
      WHERE vt.id = volunteer_team_id 
      AND vt.church_tenant_id = u.church_tenant_id
      AND u.role IN ('admin', 'pastor', 'elder', 'staff')
    )
  );

-- Newsletters Policies
CREATE POLICY "Staff can view newsletters in their tenant"
  ON newsletters FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Staff can manage newsletters in their tenant"
  ON newsletters FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

-- Slack Integrations Policies
CREATE POLICY "Admins can view slack integrations in their tenant"
  ON slack_integrations FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Admins can manage slack integrations in their tenant"
  ON slack_integrations FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder'))
  );
