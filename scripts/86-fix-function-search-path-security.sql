-- Fix security warning for function with mutable search_path
-- This prevents potential search path attacks

-- Drop and recreate the function with a fixed search_path
DROP FUNCTION IF EXISTS update_support_ticket_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_support_tickets_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();
