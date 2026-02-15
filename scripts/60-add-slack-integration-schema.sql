-- Add Slack integration for attendance tracking
-- This script creates tables for storing Slack workspace configuration

-- Create slack_workspaces table
CREATE TABLE IF NOT EXISTS slack_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL UNIQUE,
  team_name TEXT NOT NULL,
  bot_token TEXT NOT NULL,
  bot_user_id TEXT NOT NULL,
  channel_id TEXT, -- Optional: default channel for attendance notifications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_church_tenant ON slack_workspaces(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_team_id ON slack_workspaces(team_id);

-- Enable RLS
ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their church's Slack workspace" ON slack_workspaces;
DROP POLICY IF EXISTS "Lead admins can manage Slack workspace" ON slack_workspaces;
DROP POLICY IF EXISTS "Super admins can manage all Slack workspaces" ON slack_workspaces;

CREATE POLICY "Users can view their church's Slack workspace"
ON slack_workspaces FOR SELECT
USING (
  church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  )
);

CREATE POLICY "Lead admins can manage Slack workspace"
ON slack_workspaces FOR ALL
USING (
  church_tenant_id IN (
    SELECT cm.church_tenant_id 
    FROM church_members cm
    WHERE cm.user_id = auth.uid()
    AND cm.role IN ('lead_admin', 'admin')
  )
);

CREATE POLICY "Super admins can manage all Slack workspaces"
ON slack_workspaces FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
  )
);
