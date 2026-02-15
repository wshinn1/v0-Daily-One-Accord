-- Add favicon_url column to seo_settings table
ALTER TABLE seo_settings
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Add comment
COMMENT ON COLUMN seo_settings.favicon_url IS 'URL to the uploaded favicon image';
