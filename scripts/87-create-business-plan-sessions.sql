-- Create business_plan_sessions table for token-based authentication
CREATE TABLE IF NOT EXISTS business_plan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES business_plan_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_plan_sessions_token ON business_plan_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_business_plan_sessions_user_id ON business_plan_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_plan_sessions_expires_at ON business_plan_sessions(expires_at);

-- Enable RLS
ALTER TABLE business_plan_sessions ENABLE ROW LEVEL SECURITY;

-- Fixed RLS policy to use the correct users table with is_super_admin field
-- Only super admins can manage sessions
CREATE POLICY "Super admins can manage sessions" ON business_plan_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );
