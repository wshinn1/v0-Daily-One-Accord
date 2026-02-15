-- Create Zoom integration tables

-- Zoom credentials per church tenant
CREATE TABLE IF NOT EXISTS zoom_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  account_id TEXT,
  client_id TEXT,
  client_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  default_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id)
);

-- Zoom meetings created through the system
CREATE TABLE IF NOT EXISTS zoom_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  zoom_meeting_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  duration INTEGER, -- in minutes
  join_url TEXT NOT NULL,
  start_url TEXT,
  password TEXT,
  slack_channel_id TEXT,
  slack_message_ts TEXT,
  created_by UUID REFERENCES users(id),
  meeting_type TEXT DEFAULT 'instant', -- instant, scheduled, recurring
  status TEXT DEFAULT 'scheduled', -- scheduled, started, ended
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE zoom_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zoom_integrations
DROP POLICY IF EXISTS "Users can view zoom config for their church" ON zoom_integrations;
DROP POLICY IF EXISTS "Admins can manage zoom config for their church" ON zoom_integrations;
DROP POLICY IF EXISTS "Super admins can manage all zoom configs" ON zoom_integrations;

CREATE POLICY "Users can view zoom config for their church"
ON zoom_integrations FOR SELECT
USING (
  church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage zoom config for their church"
ON zoom_integrations FOR ALL
USING (
  church_tenant_id IN (
    SELECT cm.church_tenant_id 
    FROM church_members cm
    JOIN users u ON u.id = cm.user_id
    WHERE u.id = auth.uid() 
    AND cm.role IN ('lead_admin', 'admin_staff')
  )
);

CREATE POLICY "Super admins can manage all zoom configs"
ON zoom_integrations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
  )
);

-- RLS Policies for zoom_meetings
DROP POLICY IF EXISTS "Users can view zoom meetings for their church" ON zoom_meetings;
DROP POLICY IF EXISTS "Users can create zoom meetings for their church" ON zoom_meetings;
DROP POLICY IF EXISTS "Super admins can manage all zoom meetings" ON zoom_meetings;

CREATE POLICY "Users can view zoom meetings for their church"
ON zoom_meetings FOR SELECT
USING (
  church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create zoom meetings for their church"
ON zoom_meetings FOR INSERT
WITH CHECK (
  church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage all zoom meetings"
ON zoom_meetings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_zoom_integrations_tenant ON zoom_integrations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_tenant ON zoom_meetings(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_zoom_id ON zoom_meetings(zoom_meeting_id);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_status ON zoom_meetings(status);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_start_time ON zoom_meetings(start_time);
