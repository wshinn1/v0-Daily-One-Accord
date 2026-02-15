-- Fix security issues for seo_settings table

-- Enable Row Level Security on seo_settings table
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to SEO settings (needed for public pages)
CREATE POLICY "Allow public read access to seo_settings"
  ON seo_settings
  FOR SELECT
  TO public
  USING (true);

-- Only allow authenticated super admins to update SEO settings
CREATE POLICY "Allow super admins to update seo_settings"
  ON seo_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Only allow super admins to insert SEO settings
CREATE POLICY "Allow super admins to insert seo_settings"
  ON seo_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Fix function search_path vulnerability by setting it explicitly
CREATE OR REPLACE FUNCTION update_seo_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS update_seo_settings_timestamp ON seo_settings;
CREATE TRIGGER update_seo_settings_timestamp
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_settings_timestamp();
