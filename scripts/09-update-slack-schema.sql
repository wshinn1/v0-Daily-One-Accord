-- Update slack_integrations table to add missing columns
ALTER TABLE slack_integrations 
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS bot_token TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- Create slack_channels table
CREATE TABLE IF NOT EXISTS slack_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slack_integration_id UUID REFERENCES slack_integrations(id) ON DELETE CASCADE,
  channel_name VARCHAR(255) NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(slack_integration_id, channel_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_slack_channels_integration ON slack_channels(slack_integration_id);
