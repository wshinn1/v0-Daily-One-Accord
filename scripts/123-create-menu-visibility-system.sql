-- Create menu visibility control system for role-based access
-- This allows lead admins to customize which menu items each role can see

-- Table to store all available menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- e.g., 'visitors', 'calendar', 'teams'
  name TEXT NOT NULL, -- Display name
  category TEXT NOT NULL, -- 'sidebar' or 'dashboard'
  group_name TEXT, -- e.g., 'Church Management', 'Communication'
  description TEXT,
  icon TEXT, -- Icon name from lucide-react
  href TEXT NOT NULL, -- Route path
  is_external BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store role-based visibility settings per tenant
CREATE TABLE IF NOT EXISTS menu_visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  menu_item_key TEXT NOT NULL REFERENCES menu_items(key) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  UNIQUE(church_tenant_id, menu_item_key, role)
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_visibility_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items (read-only for all authenticated users)
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for menu_visibility_settings
CREATE POLICY "Users can view their tenant's visibility settings"
  ON menu_visibility_settings FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Lead admins can manage visibility settings"
  ON menu_visibility_settings FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role = 'lead_admin'
    )
  )
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role = 'lead_admin'
    )
  );

-- Insert default menu items
INSERT INTO menu_items (key, name, category, group_name, description, icon, href, display_order) VALUES
  -- Sidebar items
  ('dashboard', 'Dashboard', 'sidebar', 'Overview', 'Main dashboard overview', 'LayoutDashboard', '/dashboard', 1),
  ('visitors', 'Visitors', 'sidebar', 'Church Management', 'Manage visitor information', 'Users', '/dashboard/visitors', 2),
  ('members', 'Members Directory', 'sidebar', 'Church Management', 'Church members directory', 'Users', '/dashboard/members', 3),
  ('calendar', 'Calendar', 'sidebar', 'Church Management', 'View and manage events', 'Calendar', '/dashboard/calendar', 4),
  ('rundowns', 'Rundowns', 'sidebar', 'Church Management', 'Service rundowns', 'ClipboardList', '/dashboard/rundowns', 5),
  ('attendance', 'Attendance', 'sidebar', 'Church Management', 'Track attendance records', 'BarChart3', '/dashboard/attendance', 6),
  ('teams', 'Teams', 'sidebar', 'Church Management', 'Manage ministry teams', 'Layers', '/dashboard/teams', 7),
  ('classes', 'Classes', 'sidebar', 'Church Management', 'Manage church classes', 'GraduationCap', '/dashboard/classes', 8),
  ('newsletter', 'Newsletter', 'sidebar', 'Communication', 'Send email newsletters', 'Mail', '/dashboard/newsletter', 9),
  ('sms_notifications', 'SMS Notifications', 'sidebar', 'Communication', 'Schedule and send SMS', 'Bell', '/dashboard/sms-notifications', 10),
  ('slack', 'Slack', 'sidebar', 'Communication', 'Team communication', 'MessageSquare', '/dashboard/slack', 11),
  ('messaging', 'Messaging', 'sidebar', 'Communication', 'Internal messaging', 'MessageCircle', '/dashboard/messaging', 12),
  ('zoom', 'Zoom', 'sidebar', 'Communication', 'Video conferencing', 'Video', '/dashboard/zoom', 13),
  ('media_assets', 'Media Assets', 'sidebar', 'Resources', 'Manage media files', 'FolderOpen', '/dashboard/media-assets', 14),
  ('system_users', 'System Users', 'sidebar', 'Administration', 'Manage church members', 'UserCog', '/dashboard/users', 15),
  ('settings', 'Settings', 'sidebar', 'Administration', 'Church configuration', 'Settings', '/dashboard/settings', 16),
  
  -- Dashboard cards
  ('dashboard_visitors', 'Visitors', 'dashboard', NULL, 'Manage visitor information', 'Users', '/dashboard/visitors', 101),
  ('dashboard_calendar', 'Calendar', 'dashboard', NULL, 'View and manage events', 'Calendar', '/dashboard/calendar', 102),
  ('dashboard_attendance', 'Attendance', 'dashboard', NULL, 'Track attendance records', 'BarChart3', '/dashboard/attendance', 103),
  ('dashboard_teams', 'Teams', 'dashboard', NULL, 'Manage ministry teams', 'Layers', '/dashboard/teams', 104),
  ('dashboard_classes', 'Classes', 'dashboard', NULL, 'Manage church classes', 'GraduationCap', '/dashboard/classes', 105),
  ('dashboard_newsletter', 'Newsletter', 'dashboard', NULL, 'Send email newsletters', 'Mail', '/dashboard/newsletter', 106),
  ('dashboard_sms', 'SMS Notifications', 'dashboard', NULL, 'Schedule and send SMS', 'Bell', '/dashboard/sms-notifications', 107),
  ('dashboard_rundowns', 'Rundowns', 'dashboard', NULL, 'Service rundowns', 'ClipboardList', '/dashboard/rundowns', 108),
  ('dashboard_slack', 'Slack', 'dashboard', NULL, 'Team communication', 'MessageSquare', '/dashboard/slack', 109),
  ('dashboard_media', 'Media Assets', 'dashboard', NULL, 'Manage media files', 'FolderOpen', '/dashboard/media-assets', 110),
  ('dashboard_users', 'Users', 'dashboard', NULL, 'Manage church members', 'UserCog', '/dashboard/users', 111),
  ('dashboard_settings', 'Settings', 'dashboard', NULL, 'Church configuration', 'Settings', '/dashboard/settings', 112)
ON CONFLICT (key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_visibility_tenant ON menu_visibility_settings(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_visibility_role ON menu_visibility_settings(role);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
