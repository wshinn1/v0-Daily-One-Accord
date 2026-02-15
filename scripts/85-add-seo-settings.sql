-- Add SEO settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT DEFAULT 'Daily One Accord - Church Management Software',
  site_description TEXT DEFAULT 'All-in-one church management platform with member tracking, event planning, communication tools, and more.',
  site_keywords TEXT DEFAULT 'church management, church software, member management, event planning, church communication',
  og_image_url TEXT,
  twitter_handle TEXT,
  google_analytics_id TEXT,
  google_site_verification TEXT,
  facebook_pixel_id TEXT,
  canonical_domain TEXT DEFAULT 'https://dailyoneaccord.com',
  robots_allow_indexing BOOLEAN DEFAULT true,
  sitemap_enabled BOOLEAN DEFAULT true,
  schema_org_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Insert default settings
INSERT INTO seo_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Add function to update timestamp
CREATE OR REPLACE FUNCTION update_seo_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
DROP TRIGGER IF EXISTS update_seo_settings_timestamp ON seo_settings;
CREATE TRIGGER update_seo_settings_timestamp
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_settings_timestamp();
