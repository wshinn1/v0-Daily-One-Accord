-- Fix NDA signatures foreign key to reference users table instead of business_plan_users

-- Drop the old foreign key constraint
ALTER TABLE nda_signatures 
DROP CONSTRAINT IF EXISTS nda_signatures_user_id_fkey;

-- Add new foreign key constraint referencing users table
ALTER TABLE nda_signatures 
ADD CONSTRAINT nda_signatures_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Update RLS policies to use auth.uid() correctly
DROP POLICY IF EXISTS "Users can view own NDA signatures" ON nda_signatures;
DROP POLICY IF EXISTS "Users can insert own NDA signatures" ON nda_signatures;

-- Recreate policies with correct auth reference
CREATE POLICY "Users can view own NDA signatures"
  ON nda_signatures
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NDA signatures"
  ON nda_signatures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
