-- Add team_domain to slack_workspaces table
ALTER TABLE slack_workspaces ADD COLUMN IF NOT EXISTS team_domain TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_team_domain ON slack_workspaces(team_domain);
