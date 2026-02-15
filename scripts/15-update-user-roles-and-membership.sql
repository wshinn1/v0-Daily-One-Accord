-- Update user roles to match the new role structure
-- Drop the old enum and create a new one with the updated roles
ALTER TYPE user_role RENAME TO user_role_old;

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'lead_admin',
  'admin_staff', 
  'pastoral_team',
  'volunteer_team',
  'member'
);

-- Update existing users table to use new enum
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN role TYPE user_role USING 
  CASE role::text
    WHEN 'super_admin' THEN 'super_admin'::user_role
    WHEN 'admin' THEN 'admin_staff'::user_role
    WHEN 'pastor' THEN 'pastoral_team'::user_role
    WHEN 'elder' THEN 'pastoral_team'::user_role
    WHEN 'staff' THEN 'admin_staff'::user_role
    WHEN 'volunteer' THEN 'volunteer_team'::user_role
    ELSE 'member'::user_role
  END;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'member'::user_role;

-- Drop the old enum
DROP TYPE user_role_old;

-- Create church_members table for many-to-many relationship
-- This allows users to be part of multiple churches with different roles
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  slack_connected BOOLEAN DEFAULT FALSE,
  slack_reminded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, user_id)
);

-- Create index for better performance
CREATE INDEX idx_church_members_church_tenant ON church_members(church_tenant_id);
CREATE INDEX idx_church_members_user ON church_members(user_id);
CREATE INDEX idx_church_members_role ON church_members(role);

-- Create user invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invitation_token UUID DEFAULT uuid_generate_v4(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, email)
);

-- Create index for invitations
CREATE INDEX idx_user_invitations_church_tenant ON user_invitations(church_tenant_id);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(invitation_token);

-- Migrate existing users to church_members table
INSERT INTO church_members (church_tenant_id, user_id, role, joined_at, is_active)
SELECT 
  church_tenant_id,
  id as user_id,
  role,
  created_at as joined_at,
  TRUE as is_active
FROM users
WHERE church_tenant_id IS NOT NULL
ON CONFLICT (church_tenant_id, user_id) DO NOTHING;
