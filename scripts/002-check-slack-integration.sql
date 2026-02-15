-- Check Slack Integration Status
-- Run this to see if Slack is configured for your tenant

-- Replace 'caebe310-165b-48c6-912d-2088e5d60187' with your actual tenant ID
SELECT 
  id,
  church_tenant_id,
  team_name,
  workspace_id,
  is_active,
  notification_settings,
  created_at,
  updated_at,
  CASE 
    WHEN bot_token IS NOT NULL THEN 'Bot token configured'
    ELSE 'No bot token'
  END as bot_token_status,
  CASE 
    WHEN webhook_url IS NOT NULL THEN 'Webhook configured'
    ELSE 'No webhook'
  END as webhook_status
FROM slack_integrations
WHERE church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';

-- If the above returns no rows, Slack is not set up
-- If it returns a row with is_active = false, run this to activate it:
-- UPDATE slack_integrations 
-- SET is_active = true 
-- WHERE church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';

-- Check if visitor_comment_mention is configured in notification_settings:
-- The notification_settings JSONB should have:
-- {
--   "visitor_comment_mention": {
--     "enabled": true,
--     "channel_id": "your-slack-channel-uuid-here"
--   }
-- }
