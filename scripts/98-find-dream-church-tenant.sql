-- Find Dream Church tenant ID and verify Slack integration
SELECT 
  ct.id as tenant_id,
  ct.name as church_name,
  ct.created_at,
  CASE 
    WHEN si.id IS NOT NULL THEN 'Slack CONNECTED ✅'
    ELSE 'No Slack integration ❌'
  END as slack_status,
  si.is_active,
  CASE WHEN si.bot_token IS NOT NULL THEN true ELSE false END as has_bot_token,
  CASE WHEN si.webhook_url IS NOT NULL THEN true ELSE false END as has_webhook_url
FROM church_tenants ct
LEFT JOIN slack_integrations si ON si.church_tenant_id = ct.id
WHERE ct.name ILIKE '%dream%'
ORDER BY ct.created_at DESC;
