-- Create slack_messages table for caching Slack messages
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  message_ts TEXT NOT NULL,
  user_id TEXT,
  text TEXT,
  thread_ts TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, channel_id, message_ts)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_slack_messages_tenant_channel 
  ON slack_messages(church_tenant_id, channel_id);

CREATE INDEX IF NOT EXISTS idx_slack_messages_ts 
  ON slack_messages(message_ts);

-- Enable RLS
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for slack_messages
CREATE POLICY "Users can view messages from their church"
  ON slack_messages FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert messages"
  ON slack_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update messages"
  ON slack_messages FOR UPDATE
  USING (true);

-- Verify table was created
SELECT 'slack_messages table created successfully' AS status;
