-- Add google_drive_api_key column to church_tenants table
ALTER TABLE church_tenants 
ADD COLUMN IF NOT EXISTS google_drive_api_key TEXT;

-- Add comment
COMMENT ON COLUMN church_tenants.google_drive_api_key IS 'Google Drive API key for accessing Drive files';
