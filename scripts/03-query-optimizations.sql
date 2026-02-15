-- Query Optimizations for Daily One Accord
-- Additional performance improvements for high-scale operations

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- Pre-computed views for expensive aggregate queries
-- ============================================================================

-- Daily attendance summary by church
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_attendance_summary AS
SELECT 
  church_tenant_id,
  DATE(attended_at) as attendance_date,
  COUNT(DISTINCT user_id) as unique_attendees,
  COUNT(*) as total_attendance,
  COUNT(DISTINCT event_id) as events_count
FROM attendance
GROUP BY church_tenant_id, DATE(attended_at);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_daily_attendance_summary_tenant_date 
ON daily_attendance_summary(church_tenant_id, attendance_date DESC);

-- Refresh function (call this daily via cron)
CREATE OR REPLACE FUNCTION refresh_daily_attendance_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_attendance_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VISITOR PIPELINE SUMMARY
-- Pre-computed visitor status counts for dashboard
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS visitor_pipeline_summary AS
SELECT 
  church_tenant_id,
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN assigned_to IS NOT NULL THEN 1 END) as assigned_count,
  MAX(updated_at) as last_updated
FROM visitors
GROUP BY church_tenant_id, status;

CREATE INDEX IF NOT EXISTS idx_visitor_pipeline_summary_tenant 
ON visitor_pipeline_summary(church_tenant_id);

CREATE OR REPLACE FUNCTION refresh_visitor_pipeline_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY visitor_pipeline_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- OPTIMIZED FUNCTIONS FOR COMMON QUERIES
-- Replace expensive queries with optimized functions
-- ============================================================================

-- Get upcoming events for a church (optimized with limit)
CREATE OR REPLACE FUNCTION get_upcoming_events(
  tenant_id UUID,
  days_ahead INTEGER DEFAULT 30,
  max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  location VARCHAR,
  event_type VARCHAR,
  attendee_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.start_time,
    e.end_time,
    e.location,
    e.event_type,
    COUNT(a.id) as attendee_count
  FROM events e
  LEFT JOIN attendance a ON e.id = a.event_id
  WHERE e.church_tenant_id = tenant_id
    AND e.start_time >= NOW()
    AND e.start_time <= NOW() + (days_ahead || ' days')::INTERVAL
  GROUP BY e.id, e.title, e.start_time, e.end_time, e.location, e.event_type
  ORDER BY e.start_time ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get visitor follow-up queue (optimized)
CREATE OR REPLACE FUNCTION get_visitor_follow_up_queue(
  tenant_id UUID,
  assigned_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  full_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  status VARCHAR,
  first_visit_date DATE,
  days_since_visit INTEGER,
  assigned_to UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.full_name,
    v.email,
    v.phone,
    v.status::VARCHAR,
    v.first_visit_date,
    (CURRENT_DATE - v.first_visit_date)::INTEGER as days_since_visit,
    v.assigned_to
  FROM visitors v
  WHERE v.church_tenant_id = tenant_id
    AND v.status IN ('new', 'contacted', 'follow_up')
    AND (assigned_user_id IS NULL OR v.assigned_to = assigned_user_id)
  ORDER BY v.first_visit_date ASC, v.position ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get team member availability (optimized)
CREATE OR REPLACE FUNCTION get_team_availability(
  tenant_id UUID,
  event_date DATE
)
RETURNS TABLE (
  user_id UUID,
  full_name VARCHAR,
  team_count INTEGER,
  scheduled_events INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.full_name,
    COUNT(DISTINCT tm.team_id)::INTEGER as team_count,
    COUNT(DISTINCT rta.rundown_id)::INTEGER as scheduled_events
  FROM users u
  LEFT JOIN team_members tm ON u.id = tm.user_id
  LEFT JOIN teams t ON tm.team_id = t.id AND t.church_tenant_id = tenant_id
  LEFT JOIN rundown_team_assignments rta ON u.id = rta.user_id
  LEFT JOIN event_rundowns er ON rta.rundown_id = er.id 
    AND er.event_date = event_date
    AND er.church_tenant_id = tenant_id
  WHERE u.church_tenant_id = tenant_id
  GROUP BY u.id, u.full_name
  ORDER BY scheduled_events ASC, team_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- BATCH OPERATIONS FOR BULK UPDATES
-- Optimize common bulk operations
-- ============================================================================

-- Bulk update visitor status
CREATE OR REPLACE FUNCTION bulk_update_visitor_status(
  visitor_ids UUID[],
  new_status VARCHAR,
  tenant_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE visitors
  SET status = new_status::visitor_status,
      updated_at = NOW()
  WHERE id = ANY(visitor_ids)
    AND church_tenant_id = tenant_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Bulk assign visitors
CREATE OR REPLACE FUNCTION bulk_assign_visitors(
  visitor_ids UUID[],
  assigned_user_id UUID,
  tenant_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE visitors
  SET assigned_to = assigned_user_id,
      updated_at = NOW()
  WHERE id = ANY(visitor_ids)
    AND church_tenant_id = tenant_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- Maintain data consistency automatically
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ministry_teams_updated_at BEFORE UPDATE ON ministry_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_teams_updated_at BEFORE UPDATE ON volunteer_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_rundowns_updated_at BEFORE UPDATE ON event_rundowns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slack_integrations_updated_at BEFORE UPDATE ON slack_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VACUUM AND ANALYZE RECOMMENDATIONS
-- ============================================================================

-- Run these commands periodically (Supabase does this automatically, but good to know)
-- VACUUM ANALYZE users;
-- VACUUM ANALYZE events;
-- VACUUM ANALYZE attendance;
-- VACUUM ANALYZE visitors;

-- Check table bloat
CREATE OR REPLACE FUNCTION check_table_bloat()
RETURNS TABLE (
  table_name TEXT,
  bloat_ratio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    ROUND((pg_total_relation_size(schemaname||'.'||tablename)::NUMERIC / 
           NULLIF(pg_relation_size(schemaname||'.'||tablename), 0)), 2) as bloat_ratio
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY bloat_ratio DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES
-- Use these to identify slow queries and bottlenecks
-- ============================================================================

-- Find slow queries (run in Supabase SQL editor)
-- SELECT query, calls, total_time, mean_time, max_time
-- FROM pg_stat_statements
-- WHERE query NOT LIKE '%pg_stat_statements%'
-- ORDER BY mean_time DESC
-- LIMIT 20;

-- Find missing indexes
-- SELECT schemaname, tablename, attname, n_distinct, correlation
-- FROM pg_stats
-- WHERE schemaname = 'public'
--   AND n_distinct > 100
--   AND correlation < 0.1
-- ORDER BY n_distinct DESC;

-- Check index usage
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan ASC;

-- ============================================================================
-- NOTES
-- ============================================================================

-- Materialized views should be refreshed:
-- - Daily attendance summary: Refresh daily at midnight
-- - Visitor pipeline summary: Refresh every hour during business hours

-- To set up automatic refresh (requires Supabase cron or external scheduler):
-- SELECT cron.schedule('refresh-attendance', '0 0 * * *', 'SELECT refresh_daily_attendance_summary()');
-- SELECT cron.schedule('refresh-visitors', '0 * * * *', 'SELECT refresh_visitor_pipeline_summary()');

-- Performance tips:
-- 1. Use EXPLAIN ANALYZE to understand query plans
-- 2. Monitor pg_stat_statements for slow queries
-- 3. Keep statistics up to date with ANALYZE
-- 4. Use connection pooling (Supabase does this automatically)
-- 5. Consider read replicas for analytics queries at 500+ tenants
