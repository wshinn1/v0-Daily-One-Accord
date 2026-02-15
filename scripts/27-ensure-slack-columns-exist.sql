-- Ensure Slack-related columns exist in church_tenants table
-- This script is safe to run multiple times (uses IF NOT EXISTS)

ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS slack_bot_token TEXT,
ADD COLUMN IF NOT EXISTS slack_access_token TEXT,
ADD COLUMN IF NOT EXISTS slack_team_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS slack_oauth_configured BOOLEAN DEFAULT FALSE;

-- Verify the columns were added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'church_tenants' 
    AND column_name = 'slack_bot_token'
  ) THEN
    RAISE NOTICE 'slack_bot_token column exists';
  ELSE
    RAISE EXCEPTION 'Failed to add slack_bot_token column';
  END IF;
END $$;
