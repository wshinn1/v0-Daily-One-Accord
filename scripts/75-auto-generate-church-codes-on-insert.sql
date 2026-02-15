-- Auto-generate church codes when a church tenant is created
-- This ensures every new church gets a unique code automatically

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_generate_church_code_trigger ON church_tenants;
DROP FUNCTION IF EXISTS auto_generate_church_code_on_insert();

-- Function to auto-generate church code on insert
CREATE OR REPLACE FUNCTION auto_generate_church_code_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if church_code is NULL or empty
  IF NEW.church_code IS NULL OR NEW.church_code = '' THEN
    NEW.church_code = generate_church_code();
    
    -- Ensure uniqueness (very unlikely to collide, but just in case)
    WHILE EXISTS (SELECT 1 FROM church_tenants WHERE church_code = NEW.church_code AND id != NEW.id) LOOP
      NEW.church_code = generate_church_code();
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER auto_generate_church_code_trigger
  BEFORE INSERT ON church_tenants
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_church_code_on_insert();

-- Backfill existing church tenants that don't have codes
UPDATE church_tenants
SET church_code = generate_church_code()
WHERE church_code IS NULL OR church_code = '';

-- Add helpful comment
COMMENT ON TRIGGER auto_generate_church_code_trigger ON church_tenants IS 
  'Automatically generates a unique 6-character church code for new church tenants';
