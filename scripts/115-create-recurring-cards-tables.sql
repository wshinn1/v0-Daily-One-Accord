-- Create recurring visitor cards system
-- This allows churches to create templates that automatically generate follow-up cards

-- Recurring card templates
CREATE TABLE IF NOT EXISTS visitor_recurring_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Template configuration
  recurrence_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  recurrence_interval INTEGER DEFAULT 1, -- Every X days/weeks/months
  recurrence_day_of_week INTEGER, -- 0-6 for weekly (0 = Sunday)
  recurrence_day_of_month INTEGER, -- 1-31 for monthly
  
  -- Visitor card template
  card_template JSONB NOT NULL, -- Template for the visitor card (status, assigned_to, labels, etc.)
  
  is_active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_generation_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Track generated cards from templates
CREATE TABLE IF NOT EXISTS visitor_recurring_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES visitor_recurring_templates(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recurring_templates_tenant ON visitor_recurring_templates(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_active ON visitor_recurring_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_templates_next_gen ON visitor_recurring_templates(next_generation_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_instances_template ON visitor_recurring_instances(template_id);

-- RLS Policies
ALTER TABLE visitor_recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_recurring_instances ENABLE ROW LEVEL SECURITY;

-- Templates: Users can view templates for their tenant
CREATE POLICY "Users can view recurring templates for their tenant"
  ON visitor_recurring_templates FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage recurring templates"
  ON visitor_recurring_templates FOR ALL
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin')
    )
  );

-- Instances: Users can view instances for their tenant
CREATE POLICY "Users can view recurring instances for their tenant"
  ON visitor_recurring_instances FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM visitor_recurring_templates 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );
