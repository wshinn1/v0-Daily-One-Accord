-- Check Slack integration status for tenant 00000000-0000-0000-0000-000000000001

-- Check if Slack integration exists
SELECT 
  id,
  church_tenant_id,
  workspace_id,
  team_name,
  is_active,
  notification_settings,
  created_at,
  updated_at,
  CASE 
    WHEN bot_token IS NOT NULL THEN 'Bot token set'
    ELSE 'No bot token'
  END as bot_token_status,
  CASE 
    WHEN access_token IS NOT NULL THEN 'Access token set'
    ELSE 'No access token'
  END as access_token_status,
  CASE 
    WHEN webhook_url IS NOT NULL THEN 'Webhook URL set'
    ELSE 'No webhook URL'
  END as webhook_status
FROM slack_integrations
WHERE church_tenant_id = '00000000-0000-0000-0000-000000000001';

-- Check Slack channels
SELECT 
  sc.id,
  sc.channel_id,
  sc.channel_name,
  sc.created_at,
  si.team_name
FROM slack_channels sc
JOIN slack_integrations si ON sc.slack_integration_id = si.id
WHERE si.church_tenant_id = '00000000-0000-0000-0000-000000000001';

-- Check Slack workspaces
SELECT 
  id,
  church_tenant_id,
  team_id,
  team_name,
  team_domain,
  CASE 
    WHEN bot_token IS NOT NULL THEN 'Bot token set'
    ELSE 'No bot token'
  END as bot_token_status,
  created_at,
  updated_at
FROM slack_workspaces
WHERE church_tenant_id = '00000000-0000-0000-0000-000000000001';

-- If no integration exists, show what needs to be set up
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'No Slack integration found. User needs to connect Slack from Dashboard → Slack → Integration'
    ELSE 'Slack integration exists'
  END as status
FROM slack_integrations
WHERE church_tenant_id = '00000000-0000-0000-0000-000000000001';
