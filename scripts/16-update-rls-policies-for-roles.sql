-- Drop existing RLS policies and create new ones based on roles

-- Church Members policies
DROP POLICY IF EXISTS "Users can view church members in their church" ON church_members;
DROP POLICY IF EXISTS "Admins can manage church members" ON church_members;

CREATE POLICY "Users can view church members in their church"
  ON church_members FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Lead admins and admin staff can manage members"
  ON church_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = church_members.church_tenant_id
        AND cm.role IN ('lead_admin', 'admin_staff')
    )
  );

-- User Invitations policies
DROP POLICY IF EXISTS "Admins can manage invitations" ON user_invitations;

CREATE POLICY "Lead admins and admin staff can manage invitations"
  ON user_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = user_invitations.church_tenant_id
        AND cm.role IN ('lead_admin', 'admin_staff')
    )
  );

-- Visitors policies
DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Users can manage visitors in their church" ON visitors;

CREATE POLICY "Users can view visitors in their church"
  ON visitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = visitors.church_tenant_id
        AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team', 'volunteer_team')
    )
  );

CREATE POLICY "Pastoral team and above can manage visitors"
  ON visitors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = visitors.church_tenant_id
        AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
  );

-- Events policies
DROP POLICY IF EXISTS "Users can view events in their church" ON events;
DROP POLICY IF EXISTS "Users can manage events in their church" ON events;

CREATE POLICY "All members can view events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = events.church_tenant_id
    )
  );

CREATE POLICY "Pastoral team and above can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = events.church_tenant_id
        AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
  );

-- Attendance policies
DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Users can manage attendance in their church" ON attendance;

CREATE POLICY "Volunteer team and above can view attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = attendance.church_tenant_id
        AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team', 'volunteer_team')
    )
  );

CREATE POLICY "Pastoral team and above can manage attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = attendance.church_tenant_id
        AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
  );

-- Slack integrations policies
DROP POLICY IF EXISTS "Admins can manage slack integrations" ON slack_integrations;

CREATE POLICY "Lead admins and admin staff can manage slack"
  ON slack_integrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = slack_integrations.church_tenant_id
        AND cm.role IN ('lead_admin', 'admin_staff')
    )
  );

-- Church themes policies
CREATE POLICY "Lead admins can manage themes"
  ON church_themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = church_themes.church_tenant_id
        AND cm.role = 'lead_admin'
    )
  );

CREATE POLICY "All members can view themes"
  ON church_themes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.church_tenant_id = church_themes.church_tenant_id
    )
  );
