-- Check if slack_channels exist for Dream Church and debug RLS issues

-- Check if slack_channels table exists and has data for Dream Church
SELECT 
  sc.id,
  sc.channel_name,
  sc.channel_id,
  sc.church_tenant_id,
  sc.slack_integration_id,
  ct.name as church_name
FROM slack_channels sc
JOIN church_tenants ct ON ct.id = sc.church_tenant_id
WHERE sc.church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';

-- If no channels found, check if Slack integration exists
SELECT 
  'Slack integration status:' as info,
  id,
  church_tenant_id,
  is_active,
  slack_workspace_url
FROM slack_integrations
WHERE church_tenant_id = 'caebe310-165b-48c6-912d-2088e5d60187';

-- Check RLS policies on slack_channels
SELECT 
  'RLS policies on slack_channels:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'slack_channels';
