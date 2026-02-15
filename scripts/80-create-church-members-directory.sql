-- Church Members Directory System
-- Separate from users - this is for managing the congregation/membership

-- Member Directory Table
CREATE TABLE IF NOT EXISTS member_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Address Information
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  
  -- Additional Information
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  membership_status TEXT DEFAULT 'active', -- active, inactive, visitor, etc.
  join_date DATE,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT unique_member_per_church UNIQUE(church_tenant_id, email)
);

-- Member Groups Table (Ministries, Small Groups, etc.)
CREATE TABLE IF NOT EXISTS member_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT, -- ministry, small_group, volunteer_team, etc.
  leader_id UUID REFERENCES member_directory(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_group_name_per_church UNIQUE(church_tenant_id, name)
);

-- Member Group Assignments (Many-to-Many)
CREATE TABLE IF NOT EXISTS member_group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES member_directory(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES member_groups(id) ON DELETE CASCADE,
  
  joined_date DATE DEFAULT CURRENT_DATE,
  role TEXT, -- member, leader, coordinator, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_member_group UNIQUE(member_id, group_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_directory_church ON member_directory(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_member_directory_email ON member_directory(email);
CREATE INDEX IF NOT EXISTS idx_member_directory_name ON member_directory(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_member_groups_church ON member_groups(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_member_group_assignments_member ON member_group_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_member_group_assignments_group ON member_group_assignments(group_id);

-- RLS Policies
ALTER TABLE member_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_group_assignments ENABLE ROW LEVEL SECURITY;

-- Member Directory Policies
DROP POLICY IF EXISTS "Users can view members in their church" ON member_directory;
CREATE POLICY "Users can view members in their church"
  ON member_directory FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage members in their church" ON member_directory;
CREATE POLICY "Admins can manage members in their church"
  ON member_directory FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() 
    AND is_lead_admin_or_admin_staff()
  );

-- Member Groups Policies
DROP POLICY IF EXISTS "Users can view groups in their church" ON member_groups;
CREATE POLICY "Users can view groups in their church"
  ON member_groups FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage groups in their church" ON member_groups;
CREATE POLICY "Admins can manage groups in their church"
  ON member_groups FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() 
    AND is_lead_admin_or_admin_staff()
  );

-- Member Group Assignments Policies
DROP POLICY IF EXISTS "Users can view group assignments in their church" ON member_group_assignments;
CREATE POLICY "Users can view group assignments in their church"
  ON member_group_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM member_directory
      WHERE id = member_group_assignments.member_id
      AND church_tenant_id = get_user_church_tenant_id()
    )
  );

DROP POLICY IF EXISTS "Admins can manage group assignments in their church" ON member_group_assignments;
CREATE POLICY "Admins can manage group assignments in their church"
  ON member_group_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM member_directory
      WHERE id = member_group_assignments.member_id
      AND church_tenant_id = get_user_church_tenant_id()
    )
    AND is_lead_admin_or_admin_staff()
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_member_directory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_directory_timestamp
  BEFORE UPDATE ON member_directory
  FOR EACH ROW
  EXECUTE FUNCTION update_member_directory_updated_at();

CREATE TRIGGER update_member_groups_timestamp
  BEFORE UPDATE ON member_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_member_directory_updated_at();
