-- Fix security issue with user_engagement_analytics view
-- Remove SECURITY DEFINER property

-- Drop the existing view
DROP VIEW IF EXISTS user_engagement_analytics;

-- Recreate the view without SECURITY DEFINER
CREATE VIEW user_engagement_analytics AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.church_tenant_id,
  ct.name as church_name,
  u.last_login_at,
  u.last_activity_at,
  u.login_count,
  COUNT(DISTINCT ual.id) as total_activities,
  COUNT(DISTINCT CASE WHEN ual.activity_type = 'page_view' THEN ual.id END) as page_views,
  COUNT(DISTINCT CASE WHEN ual.activity_type = 'feature_use' THEN ual.id END) as feature_uses,
  MAX(ual.created_at) as last_activity_timestamp
FROM users u
LEFT JOIN church_tenants ct ON u.church_tenant_id = ct.id
LEFT JOIN user_activity_logs ual ON u.id = ual.user_id
GROUP BY u.id, u.email, u.full_name, u.church_tenant_id, ct.name, u.last_login_at, u.last_activity_at, u.login_count;

-- Add comment explaining the security model
COMMENT ON VIEW user_engagement_analytics IS 
'User engagement analytics view. Access is controlled by RLS policies on underlying tables.';
