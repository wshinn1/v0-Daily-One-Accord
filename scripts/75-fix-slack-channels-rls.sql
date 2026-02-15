-- Fix RLS policy for slack_channels table
-- The table now uses slack_integration_id instead of church_tenant_id

-- Drop old broken policies
DROP POLICY IF EXISTS "Users can view their church slack channels" ON slack_channels;
DROP POLICY IF EXISTS "System can manage Slack channels" ON slack_channels;

-- Create correct RLS policies that join through slack_integrations
CREATE POLICY "Users can view slack channels" ON slack_channels
FOR SELECT
USING (
  slack_integration_id IN (
    SELECT id FROM slack_integrations 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert slack channels" ON slack_channels
FOR INSERT
WITH CHECK (
  slack_integration_id IN (
    SELECT id FROM slack_integrations 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update slack channels" ON slack_channels
FOR UPDATE
USING (
  slack_integration_id IN (
    SELECT id FROM slack_integrations 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete slack channels" ON slack_channels
FOR DELETE
USING (
  slack_integration_id IN (
    SELECT id FROM slack_integrations 
    WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  )
);
