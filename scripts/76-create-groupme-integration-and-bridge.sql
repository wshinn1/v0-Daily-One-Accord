-- GroupMe Integration and Slack-GroupMe Bridge System
-- This script creates tables for GroupMe integration and message bridging between Slack and GroupMe

-- Create groupme_bots table to store GroupMe bot configurations
CREATE TABLE IF NOT EXISTS groupme_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  bot_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  group_name TEXT,
  bot_token TEXT NOT NULL,
  callback_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, group_id)
);

-- Create indexes for groupme_bots
CREATE INDEX IF NOT EXISTS idx_groupme_bots_tenant ON groupme_bots(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_groupme_bots_group ON groupme_bots(group_id);

-- Enable RLS for groupme_bots
ALTER TABLE groupme_bots ENABLE ROW LEVEL SECURITY;

-- RLS policies for groupme_bots
DROP POLICY IF EXISTS "Users can view GroupMe bots for their church" ON groupme_bots;
CREATE POLICY "Users can view GroupMe bots for their church"
ON groupme_bots FOR SELECT
USING (
  church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage GroupMe bots for their church" ON groupme_bots;
CREATE POLICY "Admins can manage GroupMe bots for their church"
ON groupme_bots FOR ALL
USING (
  church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() 
    AND role IN ('lead_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
  )
);

-- Create message_bridges table to configure Slack-GroupMe bridges
CREATE TABLE IF NOT EXISTS message_bridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  
  -- Slack configuration
  slack_channel_id TEXT,
  slack_channel_name TEXT,
  
  -- GroupMe configuration
  groupme_group_id TEXT,
  groupme_group_name TEXT,
  groupme_bot_id UUID REFERENCES groupme_bots(id) ON DELETE CASCADE,
  
  -- Bridge settings
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('slack_to_groupme', 'groupme_to_slack', 'bidirectional')),
  include_sender_name BOOLEAN DEFAULT true,
  format_messages BOOLEAN DEFAULT true,
  sync_attachments BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(church_tenant_id, slack_channel_id, groupme_group_id)
);

-- Create indexes for message_bridges
CREATE INDEX IF NOT EXISTS idx_message_bridges_tenant ON message_bridges(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_message_bridges_slack_channel ON message_bridges(slack_channel_id);
CREATE INDEX IF NOT EXISTS idx_message_bridges_groupme_group ON message_bridges(groupme_group_id);
CREATE INDEX IF NOT EXISTS idx_message_bridges_enabled ON message_bridges(enabled) WHERE enabled = true;

-- Enable RLS for message_bridges
ALTER TABLE message_bridges ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_bridges
DROP POLICY IF EXISTS "Users can view bridges for their church" ON message_bridges;
CREATE POLICY "Users can view bridges for their church"
ON message_bridges FOR SELECT
USING (
  church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage bridges for their church" ON message_bridges;
CREATE POLICY "Admins can manage bridges for their church"
ON message_bridges FOR ALL
USING (
  church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() 
    AND role IN ('lead_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
  )
);

-- Create bridged_messages table to track relayed messages and prevent loops
CREATE TABLE IF NOT EXISTS bridged_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id UUID NOT NULL REFERENCES message_bridges(id) ON DELETE CASCADE,
  
  -- Source message info
  source_platform TEXT NOT NULL CHECK (source_platform IN ('slack', 'groupme')),
  source_message_id TEXT NOT NULL,
  source_user_id TEXT,
  source_user_name TEXT,
  
  -- Destination message info
  dest_platform TEXT NOT NULL CHECK (dest_platform IN ('slack', 'groupme')),
  dest_message_id TEXT,
  
  -- Message content
  message_text TEXT,
  has_attachments BOOLEAN DEFAULT false,
  
  -- Metadata
  relayed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(bridge_id, source_platform, source_message_id)
);

-- Create indexes for bridged_messages
CREATE INDEX IF NOT EXISTS idx_bridged_messages_bridge ON bridged_messages(bridge_id);
CREATE INDEX IF NOT EXISTS idx_bridged_messages_source ON bridged_messages(source_platform, source_message_id);
CREATE INDEX IF NOT EXISTS idx_bridged_messages_dest ON bridged_messages(dest_platform, dest_message_id);
CREATE INDEX IF NOT EXISTS idx_bridged_messages_relayed_at ON bridged_messages(relayed_at);

-- Enable RLS for bridged_messages
ALTER TABLE bridged_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for bridged_messages
DROP POLICY IF EXISTS "Users can view bridged messages for their church" ON bridged_messages;
CREATE POLICY "Users can view bridged messages for their church"
ON bridged_messages FOR SELECT
USING (
  bridge_id IN (
    SELECT id FROM message_bridges 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);

-- Function to clean up old bridged messages (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_bridged_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM bridged_messages
  WHERE relayed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE groupme_bots IS 'Stores GroupMe bot configurations for each church tenant';
COMMENT ON TABLE message_bridges IS 'Configures message bridges between Slack channels and GroupMe groups';
COMMENT ON TABLE bridged_messages IS 'Tracks relayed messages to prevent infinite loops';
COMMENT ON COLUMN message_bridges.sync_direction IS 'Direction of message sync: slack_to_groupme, groupme_to_slack, or bidirectional';
