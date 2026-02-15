-- Add Google Drive URL to church tenants
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS google_drive_url TEXT;

-- Update existing churches to have null google_drive_url
UPDATE church_tenants
SET google_drive_url = NULL
WHERE google_drive_url IS NULL;
