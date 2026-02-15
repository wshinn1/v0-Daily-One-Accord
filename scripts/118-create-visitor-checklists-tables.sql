-- Create checklists system for visitor cards
-- This allows teams to create onboarding checklists for visitor follow-ups

-- Checklist items table
CREATE TABLE IF NOT EXISTS visitor_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  
  position INTEGER NOT NULL DEFAULT 0, -- For ordering
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Checklist templates table (optional - for reusable checklists)
CREATE TABLE IF NOT EXISTS visitor_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  items JSONB NOT NULL, -- Array of {title, description} objects
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checklist_items_visitor ON visitor_checklist_items(visitor_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_tenant ON visitor_checklist_items(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_position ON visitor_checklist_items(visitor_id, position);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_tenant ON visitor_checklist_templates(church_tenant_id);

-- RLS Policies
ALTER TABLE visitor_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_checklist_templates ENABLE ROW LEVEL SECURITY;

-- Checklist items: Users can view items for their tenant
CREATE POLICY "Users can view checklist items for their tenant"
  ON visitor_checklist_items FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can create checklist items
CREATE POLICY "Users can create checklist items"
  ON visitor_checklist_items FOR INSERT
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can update checklist items
CREATE POLICY "Users can update checklist items"
  ON visitor_checklist_items FOR UPDATE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can delete checklist items
CREATE POLICY "Users can delete checklist items"
  ON visitor_checklist_items FOR DELETE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Templates: Users can view templates for their tenant
CREATE POLICY "Users can view checklist templates for their tenant"
  ON visitor_checklist_templates FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins can manage templates
CREATE POLICY "Admins can manage checklist templates"
  ON visitor_checklist_templates FOR ALL
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin')
    )
  );
