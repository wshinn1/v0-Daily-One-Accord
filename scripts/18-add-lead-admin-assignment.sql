-- Add lead_admin_id to church_tenants table
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS lead_admin_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_church_tenants_lead_admin ON church_tenants(lead_admin_id);

-- Update RLS policies to allow super admins to access all church data
-- Drop existing policies and recreate with super admin access

-- Church tenants policies
DROP POLICY IF EXISTS "Users can view their church tenant" ON church_tenants;
CREATE POLICY "Users can view their church tenant" ON church_tenants
  FOR SELECT
  USING (
    id IN (
      SELECT church_tenant_id FROM church_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can manage all church tenants" ON church_tenants;
CREATE POLICY "Super admins can manage all church tenants" ON church_tenants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Church members policies
DROP POLICY IF EXISTS "Users can view church members" ON church_members;
CREATE POLICY "Users can view church members" ON church_members
  FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage church members" ON church_members;
CREATE POLICY "Admins can manage church members" ON church_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.church_tenant_id = church_members.church_tenant_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Events policies
DROP POLICY IF EXISTS "Users can view events in their church" ON events;
CREATE POLICY "Users can view events in their church" ON events
  FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events" ON events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.church_tenant_id = events.church_tenant_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Attendance policies
DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
CREATE POLICY "Users can view attendance in their church" ON attendance
  FOR SELECT
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN church_members cm ON cm.church_tenant_id = e.church_tenant_id
      WHERE cm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage attendance" ON attendance;
CREATE POLICY "Admins can manage attendance" ON attendance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN church_members cm ON cm.church_tenant_id = e.church_tenant_id
      WHERE e.id = attendance.event_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Visitors policies
DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
CREATE POLICY "Users can view visitors in their church" ON visitors
  FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage visitors" ON visitors;
CREATE POLICY "Admins can manage visitors" ON visitors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.church_tenant_id = visitors.church_tenant_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
