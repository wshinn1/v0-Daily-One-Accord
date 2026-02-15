-- Fix slack_channels RLS policies to work with current schema
-- The table uses slack_integration_id, not church_tenant_id

-- Drop old broken policies
DROP POLICY IF EXISTS "Users can view their church slack channels" ON slack_channels;
DROP POLICY IF EXISTS "Users can insert slack channels for their church" ON slack_channels;
DROP POLICY IF EXISTS "Users can update their church slack channels" ON slack_channels;
DROP POLICY IF EXISTS "Users can delete their church slack channels" ON slack_channels;

-- Create new policies that work with slack_integration_id
CREATE POLICY "Users can view slack channels through integration"
ON slack_channels FOR SELECT
USING (
  slack_integration_id IN (
    SELECT id FROM slack_integrations 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert slack channels through integration"
ON slack_channels FOR INSERT
WITH CHECK (
  slack_integration_id IN (
    SELECT id FROM slack_integrations 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update slack channels through integration"
ON slack_channels FOR UPDATE
USING (
  slack_integration_id IN (
    SELECT id FROM slack_integrations 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete slack channels through integration"
ON slack_channels FOR DELETE
USING (
  slack_integration_id IN (
    SELECT id FROM slack_integrations 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);
