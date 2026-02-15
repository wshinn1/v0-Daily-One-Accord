-- Add signing_secret column to slack_workspaces to support multiple bots
ALTER TABLE slack_workspaces 
ADD COLUMN IF NOT EXISTS signing_secret TEXT,
ADD COLUMN IF NOT EXISTS app_id TEXT;

-- Create index for faster lookups by team_id
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_team_id ON slack_workspaces(team_id);

-- Add comment explaining the table structure
COMMENT ON TABLE slack_workspaces IS 'Stores Slack bot configurations for multiple bots. Each bot has its own signing_secret and bot_token.';
COMMENT ON COLUMN slack_workspaces.signing_secret IS 'The signing secret for this specific Slack bot/app';
COMMENT ON COLUMN slack_workspaces.bot_token IS 'The bot token (xoxb-...) for this specific Slack bot/app';
COMMENT ON COLUMN slack_workspaces.app_id IS 'The Slack app ID for identification';
