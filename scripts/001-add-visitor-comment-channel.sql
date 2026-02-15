-- Add visitor_comment_channel to slack_integrations notification_settings
-- This allows Slack notifications to be sent when visitors are mentioned in comments

-- The notification_settings column is JSONB, so we need to update it to include the new channel
-- This script is idempotent and can be run multiple times safely

-- Note: You'll need to configure the actual channel ID in your Slack settings UI
-- after running this script. The channel ID should be added to the notification_settings
-- JSONB object with the key 'visitor_comment_channel'

-- Example of what the notification_settings should look like after configuration:
-- {
--   "kanban": "C123456789",
--   "new_visitor": "C123456789",
--   "visitor_assignment": "C123456789",
--   "visitor_status_changed": "C123456789",
--   "visitor_comment_channel": "C987654321"
-- }

-- This script just documents the expected structure. The actual channel ID
-- will be set through the Slack settings UI in your application.

SELECT 'visitor_comment_channel field should be added to notification_settings JSONB in slack_integrations table' AS message;
