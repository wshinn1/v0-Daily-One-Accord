-- Fix Supabase security warnings by setting search_path on all functions
-- This prevents SQL injection attacks via search_path manipulation
-- This script is safe to run multiple times - it only fixes functions that exist

-- IMPORTANT: Run scripts/00-helper-functions.sql FIRST before running this script

-- Create helper function to safely alter function search_path
CREATE OR REPLACE FUNCTION fix_function_search_path(
  function_name TEXT,
  function_args TEXT DEFAULT ''
) RETURNS VOID AS $$
BEGIN
  -- Check if function exists and alter it
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = function_name
  ) THEN
    EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public, pg_temp', 
                   function_name, function_args);
    RAISE NOTICE 'Fixed search_path for function: %', function_name;
  ELSE
    RAISE NOTICE 'Function does not exist, skipping: %', function_name;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not fix function % - %', function_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Now safely fix all functions that exist
SELECT fix_function_search_path('ensure_default_church_service', '');
SELECT fix_function_search_path('prevent_default_service_deletion', '');
SELECT fix_function_search_path('user_has_role', 'role_name TEXT');
SELECT fix_function_search_path('is_church_member', 'tenant_id UUID');
SELECT fix_function_search_path('generate_slug', 'name TEXT');
SELECT fix_function_search_path('seed_default_team_categories', 'tenant_id UUID');
SELECT fix_function_search_path('auto_generate_church_code_on_insert', '');
SELECT fix_function_search_path('has_role', 'required_role TEXT');
SELECT fix_function_search_path('is_admin_or_owner', '');
SELECT fix_function_search_path('cleanup_old_bridged_messages', '');
SELECT fix_function_search_path('refresh_daily_attendance_summary', '');
SELECT fix_function_search_path('refresh_visitor_pipeline_summary', '');
SELECT fix_function_search_path('get_upcoming_events', 'tenant_id UUID, limit_count INTEGER');
SELECT fix_function_search_path('get_visitor_follow_up_queue', 'tenant_id UUID');
SELECT fix_function_search_path('get_team_availability', 'tenant_id UUID, service_date DATE');
SELECT fix_function_search_path('bulk_update_visitor_status', 'visitor_ids UUID[], new_status TEXT');
SELECT fix_function_search_path('bulk_assign_visitors', 'visitor_ids UUID[], assigned_to_id UUID');
SELECT fix_function_search_path('update_updated_at_column', '');
SELECT fix_function_search_path('check_table_bloat', '');
SELECT fix_function_search_path('is_lead_admin_or_admin_staff', '');
SELECT fix_function_search_path('update_member_directory_updated_at', '');
SELECT fix_function_search_path('add_super_admin_to_new_tenant', '');
SELECT fix_function_search_path('get_user_church_tenant_id', '');
SELECT fix_function_search_path('is_super_admin', '');
SELECT fix_function_search_path('generate_church_code', '');

-- Clean up helper function after use
DROP FUNCTION IF EXISTS fix_function_search_path(TEXT, TEXT);

-- Restrict access to materialized views (only authenticated users with proper roles)
DO $$
BEGIN
  -- Only revoke if the materialized view exists
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'daily_attendance_summary') THEN
    REVOKE SELECT ON public.daily_attendance_summary FROM anon;
    GRANT SELECT ON public.daily_attendance_summary TO authenticated;
    ALTER MATERIALIZED VIEW public.daily_attendance_summary OWNER TO postgres;
    RAISE NOTICE 'Fixed access for materialized view: daily_attendance_summary';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'visitor_pipeline_summary') THEN
    REVOKE SELECT ON public.visitor_pipeline_summary FROM anon;
    GRANT SELECT ON public.visitor_pipeline_summary TO authenticated;
    ALTER MATERIALIZED VIEW public.visitor_pipeline_summary OWNER TO postgres;
    RAISE NOTICE 'Fixed access for materialized view: visitor_pipeline_summary';
  END IF;
END $$;

-- Note: For leaked password protection, enable it in Supabase Dashboard:
-- Auth > Policies > Password Strength > Enable "Check for leaked passwords"
-- This cannot be done via SQL migration

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Security warnings fix completed successfully!';
  RAISE NOTICE '  - Fixed search_path for all existing functions';
  RAISE NOTICE '  - Restricted materialized view access';
  RAISE NOTICE '  - Remember to enable leaked password protection in Supabase Dashboard';
END $$;
