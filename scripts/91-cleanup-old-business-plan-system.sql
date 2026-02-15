-- Clean up old business plan system and consolidate to users table
-- This removes conflicts between old business_plan_users and new users table

-- Drop old business plan tables and their dependencies
DROP TABLE IF EXISTS business_plan_sessions CASCADE;
DROP TABLE IF EXISTS nda_signatures CASCADE;
DROP TABLE IF EXISTS business_plan_users CASCADE;

-- Recreate nda_signatures with correct foreign key to users table
CREATE TABLE IF NOT EXISTS nda_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_version TEXT DEFAULT '1.0',
  document_hash TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on nda_signatures
ALTER TABLE nda_signatures ENABLE ROW LEVEL SECURITY;

-- RLS policies for nda_signatures
CREATE POLICY "Users can view their own NDA signatures"
  ON nda_signatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NDA signatures"
  ON nda_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all NDA signatures"
  ON nda_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_nda_signatures_user_id ON nda_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_nda_signatures_signed_at ON nda_signatures(signed_at DESC);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Old business plan system cleaned up successfully';
  RAISE NOTICE 'NDA signatures table recreated with correct foreign keys';
END $$;
