-- Create visitor automations system
-- This allows churches to create automated workflows for visitor management

-- Automation rules table
CREATE TABLE IF NOT EXISTS visitor_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Trigger configuration
  trigger_type VARCHAR(50) NOT NULL, -- 'visitor_added', 'status_changed', 'assigned', 'due_date_approaching'
  trigger_config JSONB, -- Additional trigger parameters (e.g., specific status, days before due date)
  
  -- Action configuration
  action_type VARCHAR(50) NOT NULL, -- 'assign_to_user', 'move_to_status', 'send_slack_notification', 'add_label'
  action_config JSONB, -- Action parameters (e.g., user_id, status, channel_id, label_id)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Automation execution log
CREATE TABLE IF NOT EXISTS visitor_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES visitor_automations(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  execution_data JSONB -- Store what was done
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitor_automations_tenant ON visitor_automations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitor_automations_active ON visitor_automations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_visitor_automation_logs_automation ON visitor_automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_visitor_automation_logs_visitor ON visitor_automation_logs(visitor_id);

-- RLS Policies
ALTER TABLE visitor_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_automation_logs ENABLE ROW LEVEL SECURITY;

-- Automations: Users can view/manage automations for their tenant
CREATE POLICY "Users can view automations for their tenant"
  ON visitor_automations FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Lead admins can manage automations"
  ON visitor_automations FOR ALL
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin')
    )
  );

-- Automation logs: Users can view logs for their tenant
CREATE POLICY "Users can view automation logs for their tenant"
  ON visitor_automation_logs FOR SELECT
  USING (
    automation_id IN (
      SELECT id FROM visitor_automations 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );
