-- Create custom fields tables for Phase 1: Custom Fields System feature

-- Table for custom field definitions
CREATE TABLE IF NOT EXISTS visitor_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'checkbox')),
  field_options JSONB, -- For select type fields
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, field_name)
);

-- Table for custom field values
CREATE TABLE IF NOT EXISTS visitor_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES visitor_custom_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(visitor_id, field_id)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_visitor_custom_fields_tenant_id ON visitor_custom_fields(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitor_custom_fields_display_order ON visitor_custom_fields(display_order);
CREATE INDEX IF NOT EXISTS idx_visitor_custom_field_values_visitor_id ON visitor_custom_field_values(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_custom_field_values_field_id ON visitor_custom_field_values(field_id);

-- Enable RLS
ALTER TABLE visitor_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_custom_field_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_custom_fields
CREATE POLICY "Users can view custom fields for their tenant"
  ON visitor_custom_fields FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can create custom fields for their tenant"
  ON visitor_custom_fields FOR INSERT
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid() AND role IN ('lead_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update custom fields for their tenant"
  ON visitor_custom_fields FOR UPDATE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid() AND role IN ('lead_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete custom fields for their tenant"
  ON visitor_custom_fields FOR DELETE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid() AND role IN ('lead_admin', 'admin')
    )
  );

-- RLS Policies for visitor_custom_field_values
CREATE POLICY "Users can view custom field values for their tenant"
  ON visitor_custom_field_values FOR SELECT
  USING (
    visitor_id IN (
      SELECT id FROM visitors WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create custom field values for their tenant"
  ON visitor_custom_field_values FOR INSERT
  WITH CHECK (
    visitor_id IN (
      SELECT id FROM visitors WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update custom field values for their tenant"
  ON visitor_custom_field_values FOR UPDATE
  USING (
    visitor_id IN (
      SELECT id FROM visitors WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete custom field values for their tenant"
  ON visitor_custom_field_values FOR DELETE
  USING (
    visitor_id IN (
      SELECT id FROM visitors WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Insert some default custom fields
INSERT INTO visitor_custom_fields (church_tenant_id, field_name, field_type, display_order)
SELECT id, 'Preferred Contact Method', 'select', 1 FROM church_tenants
ON CONFLICT (church_tenant_id, field_name) DO NOTHING;

UPDATE visitor_custom_fields 
SET field_options = '["Email", "Phone", "Text Message"]'::jsonb
WHERE field_name = 'Preferred Contact Method' AND field_options IS NULL;

INSERT INTO visitor_custom_fields (church_tenant_id, field_name, field_type, display_order)
SELECT id, 'Baptized', 'checkbox', 2 FROM church_tenants
ON CONFLICT (church_tenant_id, field_name) DO NOTHING;

INSERT INTO visitor_custom_fields (church_tenant_id, field_name, field_type, display_order)
SELECT id, 'Interested in Small Groups', 'checkbox', 3 FROM church_tenants
ON CONFLICT (church_tenant_id, field_name) DO NOTHING;

SELECT 'Custom fields tables created successfully!' as status;
