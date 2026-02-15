-- Fix RLS policies to work with users table directly
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view rundowns in their church" ON event_rundowns;
DROP POLICY IF EXISTS "Lead admins and admin staff can create rundowns" ON event_rundowns;
DROP POLICY IF EXISTS "Lead admins and admin staff can update rundowns" ON event_rundowns;
DROP POLICY IF EXISTS "Lead admins and admin staff can delete rundowns" ON event_rundowns;
DROP POLICY IF EXISTS "Users can view modules in their church rundowns" ON rundown_modules;
DROP POLICY IF EXISTS "Lead admins and admin staff can manage modules" ON rundown_modules;

-- Create new policies that work with users table
CREATE POLICY "Users can view rundowns in their church"
  ON event_rundowns FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Users can create rundowns in their church"
  ON event_rundowns FOR INSERT
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Users can update rundowns in their church"
  ON event_rundowns FOR UPDATE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Users can delete rundowns in their church"
  ON event_rundowns FOR DELETE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Users can view modules in their church rundowns"
  ON rundown_modules FOR SELECT
  USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Users can manage modules in their church rundowns"
  ON rundown_modules FOR ALL
  USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );
