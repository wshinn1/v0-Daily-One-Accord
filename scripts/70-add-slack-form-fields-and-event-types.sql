-- Add custom form fields for Slack attendance
CREATE TABLE IF NOT EXISTS slack_attendance_form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'select', 'date'
  options JSONB, -- For select fields: [{"label": "Option 1", "value": "opt1"}]
  is_required BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add event type to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'service';
-- event_type can be: 'service', 'class', 'meeting', 'other'

-- Add custom field responses to attendance_by_category
ALTER TABLE attendance_by_category ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_slack_form_fields_tenant ON slack_attendance_form_fields(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- Enable RLS
ALTER TABLE slack_attendance_form_fields ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating to avoid conflicts
DROP POLICY IF EXISTS "Users can view form fields for their church" ON slack_attendance_form_fields;
DROP POLICY IF EXISTS "Admins can manage form fields" ON slack_attendance_form_fields;

-- RLS Policies
CREATE POLICY "Users can view form fields for their church"
  ON slack_attendance_form_fields FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm
      WHERE cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage form fields"
  ON slack_attendance_form_fields FOR ALL
  USING (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff')
    )
  );
