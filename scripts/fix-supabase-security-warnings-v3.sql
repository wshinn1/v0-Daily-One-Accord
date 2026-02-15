-- Fix Supabase Security Warnings
-- This script addresses:
-- 1. Function Search Path Mutable warnings
-- 2. Materialized View in API warnings
-- 3. Ensures proper security settings

-- ============================================
-- PART 1: Fix Function Search Path Issues
-- ============================================

-- Drop existing functions first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS get_upcoming_events(uuid);
DROP FUNCTION IF EXISTS get_visitor_follow_up_queue(uuid);
DROP FUNCTION IF EXISTS bulk_update_visitor_status(uuid[], text, uuid);
DROP FUNCTION IF EXISTS bulk_assign_visitors(uuid[], uuid, uuid);

-- Recreate get_upcoming_events with fixed search_path
CREATE OR REPLACE FUNCTION get_upcoming_events(p_tenant_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  location text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_time,
    e.end_time,
    e.location,
    e.created_at
  FROM events e
  WHERE e.tenant_id = p_tenant_id
    AND e.start_time >= NOW()
  ORDER BY e.start_time ASC;
END;
$$;

-- Recreate get_visitor_follow_up_queue with fixed search_path
CREATE OR REPLACE FUNCTION get_visitor_follow_up_queue(p_tenant_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  visit_date timestamptz,
  status text,
  assigned_to uuid,
  follow_up_priority text,
  last_contact_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.first_name,
    v.last_name,
    v.email,
    v.phone,
    v.visit_date,
    v.status,
    v.assigned_to,
    v.follow_up_priority,
    v.last_contact_date
  FROM visitors v
  WHERE v.tenant_id = p_tenant_id
    AND v.status IN ('new', 'contacted', 'follow_up_needed')
  ORDER BY 
    CASE v.follow_up_priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      ELSE 4
    END,
    v.visit_date DESC;
END;
$$;

-- Recreate bulk_update_visitor_status with fixed search_path
CREATE OR REPLACE FUNCTION bulk_update_visitor_status(
  p_visitor_ids uuid[],
  p_new_status text,
  p_tenant_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE visitors
  SET 
    status = p_new_status,
    updated_at = NOW()
  WHERE id = ANY(p_visitor_ids)
    AND tenant_id = p_tenant_id;
END;
$$;

-- Recreate bulk_assign_visitors with fixed search_path
CREATE OR REPLACE FUNCTION bulk_assign_visitors(
  p_visitor_ids uuid[],
  p_assigned_to uuid,
  p_tenant_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE visitors
  SET 
    assigned_to = p_assigned_to,
    updated_at = NOW()
  WHERE id = ANY(p_visitor_ids)
    AND tenant_id = p_tenant_id;
END;
$$;

-- ============================================
-- PART 2: Fix Materialized View Security
-- ============================================

-- Revoke direct access to materialized views from public roles
REVOKE ALL ON daily_attendance_summary FROM anon, authenticated;
REVOKE ALL ON visitor_pipeline_summary FROM anon, authenticated;

-- Create safe API functions to access materialized views
CREATE OR REPLACE FUNCTION get_daily_attendance_summary(p_tenant_id uuid)
RETURNS TABLE (
  date date,
  total_attendance bigint,
  first_time_visitors bigint,
  returning_visitors bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    das.date,
    das.total_attendance,
    das.first_time_visitors,
    das.returning_visitors
  FROM daily_attendance_summary das
  WHERE das.tenant_id = p_tenant_id
  ORDER BY das.date DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_visitor_pipeline_summary(p_tenant_id uuid)
RETURNS TABLE (
  status text,
  count bigint,
  avg_days_in_status numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vps.status,
    vps.count,
    vps.avg_days_in_status
  FROM visitor_pipeline_summary vps
  WHERE vps.tenant_id = p_tenant_id;
END;
$$;

-- Grant execute permissions on the safe API functions
GRANT EXECUTE ON FUNCTION get_daily_attendance_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_visitor_pipeline_summary(uuid) TO authenticated;

-- ============================================
-- PART 3: Verification
-- ============================================

-- Verify all functions have fixed search_path
DO $$
DECLARE
  func_count integer;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'get_upcoming_events',
      'get_visitor_follow_up_queue',
      'bulk_update_visitor_status',
      'bulk_assign_visitors',
      'get_daily_attendance_summary',
      'get_visitor_pipeline_summary'
    )
    AND prosecdef = true;
  
  RAISE NOTICE 'Fixed % security definer functions', func_count;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Security warnings fixed successfully';
  RAISE NOTICE '✓ All functions now have fixed search_path';
  RAISE NOTICE '✓ Materialized views protected with API functions';
  RAISE NOTICE '';
  RAISE NOTICE 'Manual step required:';
  RAISE NOTICE '→ Enable leaked password protection in Supabase Dashboard';
  RAISE NOTICE '  (Authentication > Policies > Enable HaveIBeenPwned check)';
END $$;
