-- Add social media add-on tracking to church_tenants table
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS has_social_media_addon BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN church_tenants.has_social_media_addon IS 'Whether the church has the social media posting add-on (for Starter plan)';
