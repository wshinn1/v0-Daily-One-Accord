-- Create slack_bot_configs table for storing multiple bot configurations per tenant
CREATE TABLE IF NOT EXISTS slack_bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL UNIQUE,
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  signing_secret TEXT NOT NULL,
  bot_token TEXT NOT NULL,
  bot_name TEXT DEFAULT 'Slack Bot',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, church_tenant_id)
);

-- Enable RLS
ALTER TABLE slack_bot_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view bot configs for their church" ON slack_bot_configs;
DROP POLICY IF EXISTS "Admins can manage bot configs for their church" ON slack_bot_configs;
DROP POLICY IF EXISTS "Super admins can manage all bot configs" ON slack_bot_configs;

-- Policy: Users can view bot configs for their church
CREATE POLICY "Users can view bot configs for their church"
  ON slack_bot_configs
  FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id 
      FROM church_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Admins can manage bot configs for their church
CREATE POLICY "Admins can manage bot configs for their church"
  ON slack_bot_configs
  FOR ALL
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id 
      FROM church_members 
      WHERE user_id = auth.uid() 
      AND role IN ('lead_admin', 'admin_staff')
    )
  );

-- Policy: Super admins can manage all bot configs
CREATE POLICY "Super admins can manage all bot configs"
  ON slack_bot_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_super_admin = true
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_slack_bot_configs_team_id ON slack_bot_configs(team_id);
CREATE INDEX IF NOT EXISTS idx_slack_bot_configs_tenant_id ON slack_bot_configs(church_tenant_id);
