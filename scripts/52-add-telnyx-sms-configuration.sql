-- Add Telnyx SMS configuration to church tenants
-- This allows each church to have their own phone number and messaging settings

-- Add SMS configuration columns to church_tenants
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS sms_phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS sms_messaging_profile_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_configured_at TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN church_tenants.sms_phone_number IS 'Telnyx phone number for this church (E.164 format)';
COMMENT ON COLUMN church_tenants.sms_messaging_profile_id IS 'Telnyx messaging profile ID';
COMMENT ON COLUMN church_tenants.sms_enabled IS 'Whether SMS is enabled for this church';

-- Create SMS logs table to track sent messages
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  to_phone VARCHAR(20) NOT NULL,
  from_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'sent',
  telnyx_message_id VARCHAR(255),
  sent_by UUID REFERENCES users(id),
  recipient_type VARCHAR(50), -- 'visitor', 'member', 'team', 'bulk'
  recipient_id UUID, -- ID of visitor, member, etc.
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for SMS logs
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to avoid duplicate errors
DROP POLICY IF EXISTS "Super admins can view all SMS logs" ON sms_logs;
DROP POLICY IF EXISTS "Church admins can view their SMS logs" ON sms_logs;
DROP POLICY IF EXISTS "Church admins can create SMS logs" ON sms_logs;

-- Super admins can see all SMS logs
CREATE POLICY "Super admins can view all SMS logs"
  ON sms_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Church admins can view their church's SMS logs
CREATE POLICY "Church admins can view their SMS logs"
  ON sms_logs FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
      AND role IN ('lead_admin', 'admin', 'pastor')
    )
  );

-- Church admins can insert SMS logs
CREATE POLICY "Church admins can create SMS logs"
  ON sms_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
      AND role IN ('lead_admin', 'admin', 'pastor', 'staff')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sms_logs_church_tenant ON sms_logs(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);

SELECT 'Telnyx SMS configuration added successfully' AS status;
