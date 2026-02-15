-- Diagnostic script to check Slack integration status
-- Run this to see what's in your slack_integrations table

-- Check if slack_integrations table exists and what data it has
SELECT 
  id,
  church_tenant_id,
  is_active,
  webhook_url IS NOT NULL as has_webhook,
  bot_token IS NOT NULL as has_bot_token,
  workspace_id,
  team_name,
  notification_settings,
  created_at,
  updated_at
FROM slack_integrations
WHERE church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';

-- Check slack_channels for this integration
-- Removed is_private column that doesn't exist
SELECT 
  sc.id,
  sc.slack_integration_id,
  sc.channel_id,
  sc.channel_name,
  sc.created_at
FROM slack_channels sc
JOIN slack_integrations si ON sc.slack_integration_id = si.id
WHERE si.church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';

-- If is_active is false, you can activate it with:
-- UPDATE slack_integrations 
-- SET is_active = true 
-- WHERE church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';
