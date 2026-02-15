-- Drop insecure function versions (without search_path protection)
-- Keep the secure versions (with p_ prefix parameters and search_path set)

-- Drop insecure bulk_update_visitor_status (without search_path)
DROP FUNCTION IF EXISTS public.bulk_update_visitor_status(uuid[], character varying, uuid);

-- Drop insecure get_upcoming_events (without search_path)
DROP FUNCTION IF EXISTS public.get_upcoming_events(uuid, integer, integer);

-- Drop insecure get_visitor_follow_up_queue (without search_path)
DROP FUNCTION IF EXISTS public.get_visitor_follow_up_queue(uuid, uuid);

-- Verify remaining functions have search_path protection
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  prosecdef as is_security_definer,
  proconfig as settings
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('bulk_assign_visitors', 'bulk_update_visitor_status', 'get_upcoming_events', 'get_visitor_follow_up_queue')
ORDER BY proname, arguments;
