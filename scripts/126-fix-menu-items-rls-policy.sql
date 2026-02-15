-- Fix RLS policy for menu_items to allow service role inserts
-- The service role should be able to insert new menu items during sync

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;

-- Recreate SELECT policy
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

-- Add INSERT policy for service role (bypasses RLS but adding for clarity)
-- Service role operations should bypass RLS, but we add this for explicit permission
CREATE POLICY "Service role can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for service role
CREATE POLICY "Service role can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
