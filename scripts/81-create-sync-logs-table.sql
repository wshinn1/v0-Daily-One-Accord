-- Create table to track automatic user syncs
CREATE TABLE IF NOT EXISTS user_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_completed_at TIMESTAMPTZ,
  total_tenants INTEGER DEFAULT 0,
  successful_tenants INTEGER DEFAULT 0,
  total_users_synced INTEGER DEFAULT 0,
  errors JSONB,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for querying recent syncs
CREATE INDEX IF NOT EXISTS idx_user_sync_logs_created_at ON user_sync_logs(created_at DESC);

-- RLS policies
ALTER TABLE user_sync_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can view sync logs
DROP POLICY IF EXISTS "Super admins can view sync logs" ON user_sync_logs;
CREATE POLICY "Super admins can view sync logs"
  ON user_sync_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_super_admin = true
    )
  );

COMMENT ON TABLE user_sync_logs IS 'Tracks automatic user sync operations that run every 24 hours';
