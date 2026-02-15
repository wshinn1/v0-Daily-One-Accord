-- Check if Slack integration is active
SELECT 
  id,
  church_tenant_id,
  is_active,
  webhook_url IS NOT NULL as has_webhook,
  bot_token IS NOT NULL as has_bot_token,
  notification_settings,
  created_at
FROM slack_integrations
WHERE church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';

-- If is_active is false, run this to activate it:
-- UPDATE slack_integrations 
-- SET is_active = true 
-- WHERE church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';
