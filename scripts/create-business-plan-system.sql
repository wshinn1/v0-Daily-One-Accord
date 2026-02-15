-- Business Plan User Management System
-- Completely separate from church tenant system

-- Create business plan users table
CREATE TABLE IF NOT EXISTS business_plan_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  invited_by UUID REFERENCES users(id),
  invitation_token TEXT UNIQUE,
  invitation_accepted BOOLEAN DEFAULT FALSE,
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  access_granted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create access logs table
CREATE TABLE IF NOT EXISTS business_plan_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES business_plan_users(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE business_plan_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plan_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only super admins can manage business plan users
CREATE POLICY "Super admins can view all business plan users"
  ON business_plan_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

CREATE POLICY "Super admins can insert business plan users"
  ON business_plan_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

CREATE POLICY "Super admins can update business plan users"
  ON business_plan_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

CREATE POLICY "Super admins can delete business plan users"
  ON business_plan_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Access logs policies
CREATE POLICY "Super admins can view access logs"
  ON business_plan_access_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_plan_users_email ON business_plan_users(email);
CREATE INDEX IF NOT EXISTS idx_business_plan_users_invitation_token ON business_plan_users(invitation_token);
CREATE INDEX IF NOT EXISTS idx_business_plan_access_logs_user_id ON business_plan_access_logs(user_id);

-- Insert the founder as the first business plan user
INSERT INTO business_plan_users (email, password_hash, full_name, invitation_accepted, access_granted)
VALUES ('weshinn@gmail.com', '$2a$10$placeholder', 'Wes Shinn', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;
