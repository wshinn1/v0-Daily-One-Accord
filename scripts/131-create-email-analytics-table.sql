-- Create email analytics table for tracking email performance
CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL, -- Resend email ID
  email_type TEXT NOT NULL, -- 'newsletter', 'invitation', 'notification', 'rundown', etc.
  recipient_email TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_type TEXT, -- 'hard', 'soft', 'spam'
  click_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_analytics_church_tenant ON email_analytics(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_email_id ON email_analytics(email_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_email_type ON email_analytics(email_type);
CREATE INDEX IF NOT EXISTS idx_email_analytics_sent_at ON email_analytics(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_analytics_recipient ON email_analytics(recipient_email);

-- Enable RLS
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their church's email analytics"
  ON email_analytics FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role has full access to email analytics"
  ON email_analytics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER email_analytics_updated_at
  BEFORE UPDATE ON email_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_email_analytics_updated_at();
