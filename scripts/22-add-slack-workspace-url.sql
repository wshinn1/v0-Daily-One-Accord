-- Add slack_workspace_url to church_tenants table
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS slack_workspace_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN church_tenants.slack_workspace_url IS 'URL to the church Slack workspace for easy access';
