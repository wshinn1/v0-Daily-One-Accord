-- Fix Supabase Security Warnings - Simplified Version
-- This script adds security settings to existing functions without dropping them

-- Fix search_path for get_upcoming_events
ALTER FUNCTION public.get_upcoming_events(uuid, integer)
SET search_path = public, pg_temp;

-- Fix search_path for get_visitor_follow_up_queue  
ALTER FUNCTION public.get_visitor_follow_up_queue(uuid)
SET search_path = public, pg_temp;

-- Fix search_path for bulk_update_visitor_status
ALTER FUNCTION public.bulk_update_visitor_status(uuid[], text, uuid)
SET search_path = public, pg_temp;

-- Note: Leaked Password Protection must be enabled manually in Supabase Dashboard
-- Go to: Authentication > Policies > Enable "Check for leaked passwords"
