-- Create visitor labels tables for Phase 1: Labels/Tags System feature

-- Table for label definitions
CREATE TABLE IF NOT EXISTS visitor_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Junction table for visitor-label assignments
CREATE TABLE IF NOT EXISTS visitor_label_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES visitor_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(visitor_id, label_id)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_visitor_labels_tenant_id ON visitor_labels(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitor_label_assignments_visitor_id ON visitor_label_assignments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_label_assignments_label_id ON visitor_label_assignments(label_id);

-- Enable RLS
ALTER TABLE visitor_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_label_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_labels
CREATE POLICY "Users can view labels for their tenant"
  ON visitor_labels FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can create labels for their tenant"
  ON visitor_labels FOR INSERT
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid() AND role IN ('lead_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update labels for their tenant"
  ON visitor_labels FOR UPDATE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid() AND role IN ('lead_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete labels for their tenant"
  ON visitor_labels FOR DELETE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid() AND role IN ('lead_admin', 'admin')
    )
  );

-- RLS Policies for visitor_label_assignments
CREATE POLICY "Users can view label assignments for their tenant"
  ON visitor_label_assignments FOR SELECT
  USING (
    visitor_id IN (
      SELECT id FROM visitors WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create label assignments for their tenant"
  ON visitor_label_assignments FOR INSERT
  WITH CHECK (
    visitor_id IN (
      SELECT id FROM visitors WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete label assignments for their tenant"
  ON visitor_label_assignments FOR DELETE
  USING (
    visitor_id IN (
      SELECT id FROM visitors WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Insert some default labels
INSERT INTO visitor_labels (church_tenant_id, name, color)
SELECT id, 'VIP', 'purple' FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO visitor_labels (church_tenant_id, name, color)
SELECT id, 'Needs Prayer', 'blue' FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO visitor_labels (church_tenant_id, name, color)
SELECT id, 'Interested in Membership', 'green' FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO visitor_labels (church_tenant_id, name, color)
SELECT id, 'First Time', 'yellow' FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

SELECT 'Visitor labels tables created successfully!' as status;
