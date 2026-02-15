-- Comprehensive Slack Integration Diagnostic
-- This script checks ALL Slack integrations across all tenants

-- 1. Show ALL Slack integrations in the database
SELECT 
  si.id,
  si.church_tenant_id,
  ct.name as church_name,
  si.is_active,
  si.bot_token IS NOT NULL as has_bot_token,
  si.webhook_url IS NOT NULL as has_webhook_url,
  si.notification_settings,
  si.created_at,
  si.updated_at
FROM slack_integrations si
LEFT JOIN church_tenants ct ON ct.id = si.church_tenant_id
ORDER BY si.created_at DESC;

-- 2. Check if there are any Slack integrations at all
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'No Slack integrations found in the entire database'
    ELSE CONCAT(COUNT(*), ' Slack integration(s) found')
  END as status
FROM slack_integrations;

-- 3. Show which tenants have Slack and which don't
SELECT 
  ct.id as tenant_id,
  ct.name as church_name,
  CASE 
    WHEN si.id IS NOT NULL THEN 'Slack Connected'
    ELSE 'No Slack Integration'
  END as slack_status,
  si.is_active
FROM church_tenants ct
LEFT JOIN slack_integrations si ON si.church_tenant_id = ct.id
ORDER BY ct.name;

-- 4. Check the specific tenant for wes@wesshinn.com
SELECT 
  'Checking tenant 00000000-0000-0000-0000-000000000001' as info,
  ct.name as church_name,
  CASE 
    WHEN si.id IS NOT NULL THEN 'Slack integration EXISTS'
    ELSE 'NO Slack integration found'
  END as status,
  si.is_active,
  si.bot_token IS NOT NULL as has_bot_token,
  si.webhook_url IS NOT NULL as has_webhook_url
FROM church_tenants ct
LEFT JOIN slack_integrations si ON si.church_tenant_id = ct.id
WHERE ct.id = '00000000-0000-0000-0000-000000000001';
