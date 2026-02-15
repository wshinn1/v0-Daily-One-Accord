-- Add SMS Notifications and Scheduling System
-- This script creates tables for scheduled SMS notifications and bulk messaging

-- Create scheduled_sms table for event reminders and scheduled messages
CREATE TABLE IF NOT EXISTS scheduled_sms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  recipient_type VARCHAR(50) NOT NULL, -- 'all_members', 'event_attendees', 'specific_group'
  recipient_filter JSONB, -- Additional filters for recipients
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sending', 'sent', 'failed', 'cancelled'
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_church_tenant ON scheduled_sms(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_status ON scheduled_sms(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_scheduled_for ON scheduled_sms(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_event ON scheduled_sms(event_id);

-- Enable RLS
ALTER TABLE scheduled_sms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can manage all scheduled SMS" ON scheduled_sms;
DROP POLICY IF EXISTS "Admins can manage scheduled SMS for their church" ON scheduled_sms;
DROP POLICY IF EXISTS "Users can view scheduled SMS for their church" ON scheduled_sms;

-- RLS Policies for scheduled_sms
CREATE POLICY "Super admins can manage all scheduled SMS"
  ON scheduled_sms
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admins can manage scheduled SMS for their church"
  ON scheduled_sms
  FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pastor', 'elder')
    )
  );

CREATE POLICY "Users can view scheduled SMS for their church"
  ON scheduled_sms
  FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
    )
  );

-- Create bulk_sms_campaigns table for manual bulk messaging
CREATE TABLE IF NOT EXISTS bulk_sms_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_type VARCHAR(50) NOT NULL, -- 'all_members', 'specific_group', 'custom_list'
  recipient_filter JSONB,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sending', 'completed', 'failed'
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_bulk_sms_church_tenant ON bulk_sms_campaigns(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sms_status ON bulk_sms_campaigns(status);

-- Enable RLS
ALTER TABLE bulk_sms_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can manage all bulk SMS campaigns" ON bulk_sms_campaigns;
DROP POLICY IF EXISTS "Admins can manage bulk SMS for their church" ON bulk_sms_campaigns;
DROP POLICY IF EXISTS "Users can view bulk SMS for their church" ON bulk_sms_campaigns;

-- RLS Policies for bulk_sms_campaigns
CREATE POLICY "Super admins can manage all bulk SMS campaigns"
  ON bulk_sms_campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admins can manage bulk SMS for their church"
  ON bulk_sms_campaigns
  FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pastor', 'elder')
    )
  );

CREATE POLICY "Users can view bulk SMS for their church"
  ON bulk_sms_campaigns
  FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
    )
  );

SELECT 'SMS notifications schema created successfully' AS result;
