-- Add slack_user_id column to users table for Slack user mapping
ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_user_id VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_slack_user_id ON users(slack_user_id);

-- Add comment explaining the column
COMMENT ON COLUMN users.slack_user_id IS 'Slack user ID for @mentioning users in Slack notifications';
