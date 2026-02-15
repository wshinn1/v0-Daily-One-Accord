-- Fix security warning for update_email_analytics_updated_at function
-- Add SECURITY DEFINER and fixed search_path to prevent search_path injection attacks

DROP FUNCTION IF EXISTS update_email_analytics_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_email_analytics_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS email_analytics_updated_at ON email_analytics;

CREATE TRIGGER email_analytics_updated_at
  BEFORE UPDATE ON email_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_email_analytics_updated_at();
