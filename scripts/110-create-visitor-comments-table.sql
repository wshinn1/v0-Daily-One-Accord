-- Create visitor_comments table for Phase 1: Comments System feature

CREATE TABLE IF NOT EXISTS visitor_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_visitor_comments_visitor_id ON visitor_comments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_comments_tenant_id ON visitor_comments(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitor_comments_user_id ON visitor_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_comments_created_at ON visitor_comments(created_at DESC);

-- Enable RLS
ALTER TABLE visitor_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_comments
CREATE POLICY "Users can view comments for their tenant"
  ON visitor_comments FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments for their tenant"
  ON visitor_comments FOR INSERT
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own comments"
  ON visitor_comments FOR DELETE
  USING (user_id = auth.uid());

SELECT 'Visitor comments table created successfully!' as status;
