-- Add attendance categories for tracking different groups
CREATE TABLE IF NOT EXISTS attendance_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Add attendance counts by category
CREATE TABLE IF NOT EXISTS attendance_by_category (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES attendance_categories(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(event_id, category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_categories_tenant ON attendance_categories(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_by_category_event ON attendance_by_category(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_by_category_tenant ON attendance_by_category(church_tenant_id);

-- Insert default categories for existing tenants
INSERT INTO attendance_categories (church_tenant_id, name, description, display_order)
SELECT 
  id,
  'Adults',
  'Adult attendance (18+)',
  1
FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO attendance_categories (church_tenant_id, name, description, display_order)
SELECT 
  id,
  'Children',
  'Children attendance (0-12)',
  2
FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO attendance_categories (church_tenant_id, name, description, display_order)
SELECT 
  id,
  'Youth',
  'Youth attendance (13-17)',
  3
FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO attendance_categories (church_tenant_id, name, description, display_order)
SELECT 
  id,
  'Visitors',
  'First-time visitors',
  4
FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

-- Add RLS policies
ALTER TABLE attendance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_by_category ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view categories for their church" ON attendance_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON attendance_categories;
DROP POLICY IF EXISTS "Users can view attendance by category" ON attendance_by_category;
DROP POLICY IF EXISTS "Admins can manage attendance by category" ON attendance_by_category;

-- Policies for attendance_categories
CREATE POLICY "Users can view categories for their church"
  ON attendance_categories FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage categories"
  ON attendance_categories FOR ALL
  USING (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
  );

-- Policies for attendance_by_category
CREATE POLICY "Users can view attendance by category"
  ON attendance_by_category FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage attendance by category"
  ON attendance_by_category FOR ALL
  USING (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
  );
