-- Add church_code field to church_tenants table
ALTER TABLE church_tenants 
ADD COLUMN church_code VARCHAR(20) UNIQUE;

-- Generate random codes for existing churches
UPDATE church_tenants 
SET church_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE church_code IS NULL;

-- Make church_code NOT NULL after populating existing records
ALTER TABLE church_tenants 
ALTER COLUMN church_code SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX idx_church_tenants_code ON church_tenants(church_code);

-- Function to generate a unique church code
CREATE OR REPLACE FUNCTION generate_church_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM church_tenants WHERE church_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policy to allow public read of church names and codes for signup
DROP POLICY IF EXISTS "Allow public read of church tenants for signup" ON church_tenants;
CREATE POLICY "Allow public read of church tenants for signup"
  ON church_tenants
  FOR SELECT
  TO anon
  USING (true);
