-- Add QR code URL column to classes table
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Add comment
COMMENT ON COLUMN classes.qr_code_url IS 'URL to the stored QR code image in Vercel Blob';
