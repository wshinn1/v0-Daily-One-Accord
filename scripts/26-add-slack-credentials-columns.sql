-- Add columns to store Slack App credentials for each church tenant
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS slack_client_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS slack_client_secret VARCHAR(255);
