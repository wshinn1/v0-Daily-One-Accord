-- Fix slack_channels RLS policies to support super admins
-- Super admins should be able to see all channels

-- Drop ALL existing policies (both old and new names)
DROP POLICY IF EXISTS "Users can view their church slack channels" ON slack_channels;
DROP POLICY IF EXISTS "Users can view slack channels" ON slack_channels;
DROP POLICY IF EXISTS "Users can insert slack channels for their church" ON slack_channels;
DROP POLICY IF EXISTS "Users can insert slack channels" ON slack_channels;
DROP POLICY IF EXISTS "Users can update their church slack channels" ON slack_channels;
DROP POLICY IF EXISTS "Users can update slack channels" ON slack_channels;
DROP POLICY IF EXISTS "Users can delete their church slack channels" ON slack_channels;
DROP POLICY IF EXISTS "Users can delete slack channels" ON slack_channels;

-- Create new policies that support super admins
CREATE POLICY "Users can view slack channels"
ON slack_channels FOR SELECT
USING (
  -- Super admins can see all channels
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_super_admin = true
  )
  OR
  -- Regular users can see channels for their church
  EXISTS (
    SELECT 1 FROM slack_integrations si
    JOIN users u ON u.church_tenant_id = si.church_tenant_id
    WHERE si.id = slack_channels.slack_integration_id
    AND u.id = auth.uid()
  )
);

CREATE POLICY "Users can insert slack channels"
ON slack_channels FOR INSERT
WITH CHECK (
  -- Super admins can insert any channel
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_super_admin = true
  )
  OR
  -- Regular users can insert channels for their church
  EXISTS (
    SELECT 1 FROM slack_integrations si
    JOIN users u ON u.church_tenant_id = si.church_tenant_id
    WHERE si.id = slack_channels.slack_integration_id
    AND u.id = auth.uid()
  )
);

CREATE POLICY "Users can update slack channels"
ON slack_channels FOR UPDATE
USING (
  -- Super admins can update any channel
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_super_admin = true
  )
  OR
  -- Regular users can update channels for their church
  EXISTS (
    SELECT 1 FROM slack_integrations si
    JOIN users u ON u.church_tenant_id = si.church_tenant_id
    WHERE si.id = slack_channels.slack_integration_id
    AND u.id = auth.uid()
  )
);

CREATE POLICY "Users can delete slack channels"
ON slack_channels FOR DELETE
USING (
  -- Super admins can delete any channel
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_super_admin = true
  )
  OR
  -- Regular users can delete channels for their church
  EXISTS (
    SELECT 1 FROM slack_integrations si
    JOIN users u ON u.church_tenant_id = si.church_tenant_id
    WHERE si.id = slack_channels.slack_integration_id
    AND u.id = auth.uid()
  )
);
