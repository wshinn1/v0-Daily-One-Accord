-- Create NDA signatures table
CREATE TABLE IF NOT EXISTS nda_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES business_plan_users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  signature_data TEXT NOT NULL, -- Base64 encoded signature image
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  document_version TEXT DEFAULT '1.0',
  document_hash TEXT NOT NULL, -- SHA-256 hash of the NDA document
  pdf_url TEXT, -- URL to the signed PDF in Blob storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nda_signatures_user_id ON nda_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_nda_signatures_email ON nda_signatures(email);
CREATE INDEX IF NOT EXISTS idx_nda_signatures_signed_at ON nda_signatures(signed_at DESC);

-- Enable RLS
ALTER TABLE nda_signatures ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own NDA signatures
CREATE POLICY "Users can view own NDA signatures"
  ON nda_signatures
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own NDA signatures
CREATE POLICY "Users can insert own NDA signatures"
  ON nda_signatures
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Super admins can view all NDA signatures (handled in application layer)
