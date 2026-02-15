-- Feature Flags System
-- Allows enabling/disabling features globally or per-tenant

-- Feature flags table (global feature definitions)
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled_by_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant-specific feature overrides
CREATE TABLE IF NOT EXISTS tenant_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL,
  enabled_by UUID REFERENCES users(id),
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(church_tenant_id, feature_flag_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_tenant ON tenant_feature_flags(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_flag ON tenant_feature_flags(feature_flag_id);

-- Insert default feature flags
INSERT INTO feature_flags (flag_key, name, description, enabled_by_default) VALUES
  ('slack_integration', 'Slack Integration', 'Enable Slack workspace integration and notifications', true),
  ('google_drive_integration', 'Google Drive Integration', 'Enable Google Drive integration for file storage', true),
  ('advanced_analytics', 'Advanced Analytics', 'Access to advanced analytics and reporting features', false),
  ('custom_branding', 'Custom Branding', 'Allow custom logos, colors, and branding', false),
  ('api_access', 'API Access', 'Enable REST API access for external integrations', false),
  ('bulk_operations', 'Bulk Operations', 'Enable bulk user management and data operations', true),
  ('email_notifications', 'Email Notifications', 'Send email notifications for events', true),
  ('sms_notifications', 'SMS Notifications', 'Send SMS notifications via Telnyx', false),
  ('rundown_system', 'Rundown System', 'Service rundown planning and management', true),
  ('attendance_tracking', 'Attendance Tracking', 'Track member attendance at services', true)
ON CONFLICT (flag_key) DO NOTHING;

-- RLS Policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_feature_flags ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all feature flags
CREATE POLICY "Super admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Super admins can manage tenant feature overrides
CREATE POLICY "Super admins can manage tenant feature flags"
  ON tenant_feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Tenants can view their own feature flags
CREATE POLICY "Tenants can view their feature flags"
  ON tenant_feature_flags FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );
