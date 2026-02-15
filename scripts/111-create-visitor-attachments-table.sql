-- Create visitor_attachments table for Phase 1: File Attachments feature

CREATE TABLE IF NOT EXISTS visitor_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_visitor_attachments_visitor_id ON visitor_attachments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_attachments_tenant_id ON visitor_attachments(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitor_attachments_user_id ON visitor_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_attachments_created_at ON visitor_attachments(created_at DESC);

-- Enable RLS
ALTER TABLE visitor_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_attachments
CREATE POLICY "Users can view attachments for their tenant"
  ON visitor_attachments FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments for their tenant"
  ON visitor_attachments FOR INSERT
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own attachments"
  ON visitor_attachments FOR DELETE
  USING (user_id = auth.uid());

SELECT 'Visitor attachments table created successfully!' as status;
