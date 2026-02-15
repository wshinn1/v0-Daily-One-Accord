-- Check if slack_channels table exists and show its structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'slack_channels'
ORDER BY ordinal_position;

-- If table exists, check for Dream Church channels
SELECT 
  sc.*,
  ct.name as church_name
FROM slack_channels sc
LEFT JOIN church_tenants ct ON ct.id = sc.church_tenant_id
WHERE ct.name = 'Dream Church'
LIMIT 10;
