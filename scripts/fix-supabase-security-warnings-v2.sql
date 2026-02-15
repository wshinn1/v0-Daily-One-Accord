-- Fix Supabase Security Warnings
-- This script addresses security warnings from the Supabase linter

-- ============================================
-- 1. Fix Function Search Path Mutable Issues
-- ============================================
-- These functions need a fixed search_path to prevent search path attacks

-- Fix get_upcoming_events function
CREATE OR REPLACE FUNCTION public.get_upcoming_events(tenant_id_param UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  location TEXT,
  created_at TIMESTAMPTZ
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
  WHERE e.tenant_id = tenant_id_param
    AND e.start_time >= NOW()
  ORDER BY e.start_time ASC;
END;
$$;

-- Fix get_visitor_follow_up_queue function
CREATE OR REPLACE FUNCTION public.get_visitor_follow_up_queue(tenant_id_param UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  visit_date TIMESTAMPTZ,
  status TEXT,
  assigned_to UUID,
  follow_up_notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.full_name,
    v.email,
    v.phone,
    v.visit_date,
    v.status,
    v.assigned_to,
    v.follow_up_notes
  FROM visitors v
  WHERE v.tenant_id = tenant_id_param
    AND v.status IN ('new', 'contacted', 'follow_up_needed')
  ORDER BY v.visit_date DESC;
END;
$$;

-- Fix bulk_update_visitor_status function
CREATE OR REPLACE FUNCTION public.bulk_update_visitor_status(
  visitor_ids UUID[],
  new_status TEXT,
  tenant_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE visitors
  SET status = new_status,
      updated_at = NOW()
  WHERE id = ANY(visitor_ids)
    AND tenant_id = tenant_id_param;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Fix bulk_assign_visitors function
CREATE OR REPLACE FUNCTION public.bulk_assign_visitors(
  visitor_ids UUID[],
  assigned_user_id UUID,
  tenant_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE visitors
  SET assigned_to = assigned_user_id,
      updated_at = NOW()
  WHERE id = ANY(visitor_ids)
    AND tenant_id = tenant_id_param;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- ============================================
-- 2. Fix Materialized View API Exposure
-- ============================================
-- Revoke direct access to materialized views from anon/authenticated roles
-- Access should go through RLS-protected tables or specific functions

-- Revoke access from daily_attendance_summary
REVOKE SELECT ON public.daily_attendance_summary FROM anon;
REVOKE SELECT ON public.daily_attendance_summary FROM authenticated;

-- Grant access only to service_role
GRANT SELECT ON public.daily_attendance_summary TO service_role;

-- Revoke access from visitor_pipeline_summary
REVOKE SELECT ON public.visitor_pipeline_summary FROM anon;
REVOKE SELECT ON public.visitor_pipeline_summary FROM authenticated;

-- Grant access only to service_role
GRANT SELECT ON public.visitor_pipeline_summary TO service_role;

-- ============================================
-- 3. Create Safe API Functions for Materialized Views
-- ============================================
-- Create functions that provide controlled access to materialized view data

CREATE OR REPLACE FUNCTION public.get_attendance_summary(
  tenant_id_param UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  total_attendance INTEGER,
  service_name TEXT
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
    das.service_name
  FROM daily_attendance_summary das
  WHERE das.tenant_id = tenant_id_param
    AND das.date BETWEEN start_date AND end_date
  ORDER BY das.date DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_visitor_pipeline(tenant_id_param UUID)
RETURNS TABLE (
  status TEXT,
  count INTEGER,
  percentage NUMERIC
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
    vps.percentage
  FROM visitor_pipeline_summary vps
  WHERE vps.tenant_id = tenant_id_param
  ORDER BY vps.count DESC;
END;
$$;

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Security warnings fixed successfully!';
  RAISE NOTICE '1. Fixed search_path for 4 functions';
  RAISE NOTICE '2. Secured 2 materialized views';
  RAISE NOTICE '3. Created safe API functions for materialized view access';
  RAISE NOTICE '';
  RAISE NOTICE 'MANUAL ACTION REQUIRED:';
  RAISE NOTICE 'Enable leaked password protection in Supabase Dashboard:';
  RAISE NOTICE 'Authentication > Policies > Enable "Password Strength and Leaked Password Protection"';
END $$;
