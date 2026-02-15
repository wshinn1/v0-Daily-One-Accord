-- Add Slack OAuth tokens and configuration to church_tenants
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS slack_bot_token TEXT,
ADD COLUMN IF NOT EXISTS slack_access_token TEXT,
ADD COLUMN IF NOT EXISTS slack_team_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS slack_oauth_configured BOOLEAN DEFAULT FALSE;

-- Create table to store Slack channel information
CREATE TABLE IF NOT EXISTS slack_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) NOT NULL,
  channel_name VARCHAR(255) NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, channel_id)
);

-- Create table to cache Slack messages for faster loading
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) NOT NULL,
  message_ts VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  text TEXT,
  thread_ts VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, channel_id, message_ts)
);

-- Enable RLS
ALTER TABLE slack_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slack_channels
CREATE POLICY "Users can view their church slack channels" ON slack_channels FOR SELECT USING (
  church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
);

-- RLS Policies for slack_messages
CREATE POLICY "Users can view their church slack messages" ON slack_messages FOR SELECT USING (
  church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_slack_messages_channel ON slack_messages(church_tenant_id, channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slack_channels_tenant ON slack_channels(church_tenant_id);
