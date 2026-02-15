-- Create user invitations table if it doesn't exist
-- This table tracks email invitations sent to users to join a church tenant

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_church_tenant ON user_invitations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admins to manage invitations
CREATE POLICY "Admins can manage invitations" 
ON user_invitations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM church_members cm
    WHERE cm.user_id = auth.uid()
    AND cm.role IN ('lead_admin', 'admin_staff')
    AND cm.church_tenant_id = user_invitations.church_tenant_id
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_super_admin = TRUE
  )
);

SELECT 'User invitations table created successfully' as result;
