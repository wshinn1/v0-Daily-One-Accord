-- Add Email Templates System
-- This script creates tables for storing email templates and their blocks

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_templates_church_tenant ON email_templates(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_default ON email_templates(is_default);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can manage all email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can manage email templates for their church" ON email_templates;
DROP POLICY IF EXISTS "Users can view email templates for their church" ON email_templates;

-- RLS Policies for email_templates
CREATE POLICY "Super admins can manage all email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admins can manage email templates for their church"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pastor', 'elder')
    )
  );

CREATE POLICY "Users can view email templates for their church"
  ON email_templates
  FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
    )
  );

-- Add html_content column to newsletters table for storing rendered HTML
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS html_content TEXT;
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL;

SELECT 'Email templates schema created successfully' AS result;
