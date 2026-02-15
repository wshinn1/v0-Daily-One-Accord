-- Check and fix Slack integration status for Dream Church

-- First, check current status
SELECT 
  si.id,
  ct.name as church_name,
  si.is_active,
  si.webhook_url IS NOT NULL as has_webhook,
  si.bot_token IS NOT NULL as has_bot_token,
  si.created_at,
  si.updated_at
FROM slack_integrations si
JOIN church_tenants ct ON ct.id = si.church_tenant_id
WHERE ct.name = 'Dream Church';

-- If is_active is false but credentials exist, fix it
UPDATE slack_integrations
SET 
  is_active = true,
  updated_at = NOW()
WHERE church_tenant_id = (
  SELECT id FROM church_tenants WHERE name = 'Dream Church'
)
AND is_active = false
AND webhook_url IS NOT NULL
AND bot_token IS NOT NULL;

-- Verify the fix
SELECT 
  si.id,
  ct.name as church_name,
  si.is_active,
  'Slack integration is now active! ✅' as status
FROM slack_integrations si
JOIN church_tenants ct ON ct.id = si.church_tenant_id
WHERE ct.name = 'Dream Church';
