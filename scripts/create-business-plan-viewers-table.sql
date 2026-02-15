-- Create table for approved business plan viewers
CREATE TABLE IF NOT EXISTS approved_business_plan_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE approved_business_plan_viewers ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can manage viewers
CREATE POLICY "Super admins can manage business plan viewers"
  ON approved_business_plan_viewers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_business_plan_viewers_email 
  ON approved_business_plan_viewers(email);

-- Insert the founder as the first approved viewer
INSERT INTO approved_business_plan_viewers (email, full_name)
VALUES ('weshinn@gmail.com', 'Wes Shinn')
ON CONFLICT (email) DO NOTHING;
