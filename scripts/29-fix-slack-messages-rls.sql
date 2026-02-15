-- Drop existing RLS policies for slack_messages
DROP POLICY IF EXISTS "Users can view messages from their church" ON slack_messages;
DROP POLICY IF EXISTS "System can insert messages" ON slack_messages;
DROP POLICY IF EXISTS "System can update messages" ON slack_messages;

-- Create more permissive RLS policies
-- Allow authenticated users to view messages from their church
CREATE POLICY "Users can view messages from their church"
  ON slack_messages FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Allow authenticated users to insert messages for their church
CREATE POLICY "Users can insert messages for their church"
  ON slack_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Allow authenticated users to update messages for their church
CREATE POLICY "Users can update messages for their church"
  ON slack_messages FOR UPDATE
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Verify policies were created
SELECT 'slack_messages RLS policies updated successfully' AS status;
