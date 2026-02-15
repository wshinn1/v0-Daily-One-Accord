-- Add slack_workspaces table to link Slack teams to church tenants
CREATE TABLE IF NOT EXISTS slack_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL UNIQUE,
  team_name TEXT,
  bot_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;

-- Super admins can see all workspaces
CREATE POLICY "Super admins can view all slack workspaces"
  ON slack_workspaces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Lead admins and admin staff can view their tenant's workspace
CREATE POLICY "Admins can view their tenant slack workspace"
  ON slack_workspaces FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
      AND role IN ('lead_admin', 'admin_staff')
    )
  );

-- Lead admins can insert/update their tenant's workspace
CREATE POLICY "Lead admins can manage their tenant slack workspace"
  ON slack_workspaces FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
      AND role = 'lead_admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_team_id ON slack_workspaces(team_id);
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_church_tenant_id ON slack_workspaces(church_tenant_id);
