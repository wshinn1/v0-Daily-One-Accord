-- Add business plan access fields to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_business_plan_access BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS business_plan_invited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS business_plan_invited_by UUID REFERENCES users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_business_plan_access ON users(has_business_plan_access) WHERE has_business_plan_access = TRUE;

-- Add comment
COMMENT ON COLUMN users.has_business_plan_access IS 'Whether this user has access to view the business plan';
COMMENT ON COLUMN users.business_plan_invited_at IS 'When the user was invited to view the business plan';
COMMENT ON COLUMN users.business_plan_invited_by IS 'Which super admin invited this user';
