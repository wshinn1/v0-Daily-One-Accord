-- Add activity tracking columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Create user activity logs table for detailed tracking
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL, -- 'login', 'page_view', 'feature_use', 'api_call'
  activity_details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_tenant_id ON user_activity_logs(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);

-- Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own activity logs"
  ON user_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all activity logs"
  ON user_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "System can insert activity logs"
  ON user_activity_logs FOR INSERT
  WITH CHECK (true);

-- Create analytics view for super admins
CREATE OR REPLACE VIEW user_engagement_analytics AS
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
