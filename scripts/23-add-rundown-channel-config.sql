-- Add rundown channel configuration to church_tenants
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS rundown_channel_name VARCHAR(80) DEFAULT 'event-rundowns';

-- Add comment
COMMENT ON COLUMN church_tenants.rundown_channel_name IS 'Slack channel name where event rundowns will be posted';
