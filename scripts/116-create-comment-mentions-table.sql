-- Create comment mentions system
-- This allows users to @mention team members in comments

-- Comment mentions table
CREATE TABLE IF NOT EXISTS visitor_comment_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES visitor_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comment_mentions_comment ON visitor_comment_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_user ON visitor_comment_mentions(mentioned_user_id);

-- RLS Policies
ALTER TABLE visitor_comment_mentions ENABLE ROW LEVEL SECURITY;

-- Users can view mentions for their tenant
CREATE POLICY "Users can view mentions for their tenant"
  ON visitor_comment_mentions FOR SELECT
  USING (
    mentioned_user_id IN (
      SELECT id FROM users WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can create mentions when commenting
CREATE POLICY "Users can create mentions"
  ON visitor_comment_mentions FOR INSERT
  WITH CHECK (
    comment_id IN (
      SELECT id FROM visitor_comments WHERE user_id = auth.uid()
    )
  );
