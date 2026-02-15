-- Diagnostic query to find exact function signatures
-- Run this first to see the actual function definitions

SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_upcoming_events',
    'get_visitor_follow_up_queue',
    'bulk_update_visitor_status',
    'bulk_assign_visitors'
)
ORDER BY p.proname;
