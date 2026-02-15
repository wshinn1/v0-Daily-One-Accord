-- Service Team Categories Table (customizable by church tenants)
CREATE TABLE service_team_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Rundown Team Assignments Table
CREATE TABLE rundown_team_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_team_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_service_team_categories_church_tenant ON service_team_categories(church_tenant_id);
CREATE INDEX idx_rundown_team_assignments_rundown ON rundown_team_assignments(rundown_id);
CREATE INDEX idx_rundown_team_assignments_category ON rundown_team_assignments(category_id);

-- Enable RLS
ALTER TABLE service_team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_team_assignments ENABLE ROW LEVEL SECURITY;

-- Service Team Categories Policies
CREATE POLICY "Users can view team categories in their church"
  ON service_team_categories FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Lead admins can manage team categories"
  ON service_team_categories FOR ALL
  USING (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff')
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Rundown Team Assignments Policies
CREATE POLICY "Users can view team assignments in their church rundowns"
  ON rundown_team_assignments FOR SELECT
  USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Lead admins can manage team assignments"
  ON rundown_team_assignments FOR ALL
  USING (
    rundown_id IN (
      SELECT er.id FROM event_rundowns er
      JOIN church_members cm ON er.church_tenant_id = cm.church_tenant_id
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Function to seed default team categories for a church tenant
CREATE OR REPLACE FUNCTION seed_default_team_categories(tenant_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO service_team_categories (church_tenant_id, name, description, order_index)
  VALUES
    (tenant_id, 'Worship Team', 'Musicians and vocalists leading worship', 1),
    (tenant_id, 'Media Team', 'Audio, video, and presentation operators', 2),
    (tenant_id, 'Camera Team', 'Video camera operators and directors', 3),
    (tenant_id, 'Clean Up Team', 'Post-service cleanup and setup crew', 4)
  ON CONFLICT (church_tenant_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Seed default categories for existing church tenants
DO $$
DECLARE
  tenant RECORD;
BEGIN
  FOR tenant IN SELECT id FROM church_tenants LOOP
    PERFORM seed_default_team_categories(tenant.id);
  END LOOP;
END $$;
