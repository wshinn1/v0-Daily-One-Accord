-- Add database constraints for data integrity
-- Run this script to add foreign key constraints, unique constraints, and check constraints

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

-- Users table
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_church_tenant_id_fkey,
  ADD CONSTRAINT users_church_tenant_id_fkey 
    FOREIGN KEY (church_tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE CASCADE;

-- Events table
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_church_tenant_id_fkey,
  ADD CONSTRAINT events_church_tenant_id_fkey 
    FOREIGN KEY (church_tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE CASCADE;

ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_leader_id_fkey,
  ADD CONSTRAINT events_leader_id_fkey 
    FOREIGN KEY (leader_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_created_by_fkey,
  ADD CONSTRAINT events_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Attendance table
ALTER TABLE attendance
  DROP CONSTRAINT IF EXISTS attendance_user_id_fkey,
  ADD CONSTRAINT attendance_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE attendance
  DROP CONSTRAINT IF EXISTS attendance_event_id_fkey,
  ADD CONSTRAINT attendance_event_id_fkey 
    FOREIGN KEY (event_id) 
    REFERENCES events(id) 
    ON DELETE CASCADE;

ALTER TABLE attendance
  DROP CONSTRAINT IF EXISTS attendance_church_tenant_id_fkey,
  ADD CONSTRAINT attendance_church_tenant_id_fkey 
    FOREIGN KEY (church_tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE CASCADE;

-- Classes table
ALTER TABLE classes
  DROP CONSTRAINT IF EXISTS classes_church_tenant_id_fkey,
  ADD CONSTRAINT classes_church_tenant_id_fkey 
    FOREIGN KEY (church_tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE CASCADE;

ALTER TABLE classes
  DROP CONSTRAINT IF EXISTS classes_teacher_id_fkey,
  ADD CONSTRAINT classes_teacher_id_fkey 
    FOREIGN KEY (teacher_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

ALTER TABLE classes
  DROP CONSTRAINT IF EXISTS classes_created_by_fkey,
  ADD CONSTRAINT classes_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Class enrollments
ALTER TABLE class_enrollments
  DROP CONSTRAINT IF EXISTS class_enrollments_class_id_fkey,
  ADD CONSTRAINT class_enrollments_class_id_fkey 
    FOREIGN KEY (class_id) 
    REFERENCES classes(id) 
    ON DELETE CASCADE;

ALTER TABLE class_enrollments
  DROP CONSTRAINT IF EXISTS class_enrollments_user_id_fkey,
  ADD CONSTRAINT class_enrollments_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

-- Teams table
ALTER TABLE teams
  DROP CONSTRAINT IF EXISTS teams_church_tenant_id_fkey,
  ADD CONSTRAINT teams_church_tenant_id_fkey 
    FOREIGN KEY (church_tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE CASCADE;

ALTER TABLE teams
  DROP CONSTRAINT IF EXISTS teams_leader_id_fkey,
  ADD CONSTRAINT teams_leader_id_fkey 
    FOREIGN KEY (leader_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Team members
ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_team_id_fkey,
  ADD CONSTRAINT team_members_team_id_fkey 
    FOREIGN KEY (team_id) 
    REFERENCES teams(id) 
    ON DELETE CASCADE;

ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_user_id_fkey,
  ADD CONSTRAINT team_members_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

-- Visitors table
ALTER TABLE visitors
  DROP CONSTRAINT IF EXISTS visitors_church_tenant_id_fkey,
  ADD CONSTRAINT visitors_church_tenant_id_fkey 
    FOREIGN KEY (church_tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE CASCADE;

ALTER TABLE visitors
  DROP CONSTRAINT IF EXISTS visitors_assigned_to_fkey,
  ADD CONSTRAINT visitors_assigned_to_fkey 
    FOREIGN KEY (assigned_to) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Newsletters table
ALTER TABLE newsletters
  DROP CONSTRAINT IF EXISTS newsletters_church_tenant_id_fkey,
  ADD CONSTRAINT newsletters_church_tenant_id_fkey 
    FOREIGN KEY (church_tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE CASCADE;

ALTER TABLE newsletters
  DROP CONSTRAINT IF EXISTS newsletters_created_by_fkey,
  ADD CONSTRAINT newsletters_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Event rundowns
ALTER TABLE event_rundowns
  DROP CONSTRAINT IF EXISTS event_rundowns_church_tenant_id_fkey,
  ADD CONSTRAINT event_rundowns_church_tenant_id_fkey 
    FOREIGN KEY (church_tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE CASCADE;

ALTER TABLE event_rundowns
  DROP CONSTRAINT IF EXISTS event_rundowns_created_by_fkey,
  ADD CONSTRAINT event_rundowns_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Rundown modules
ALTER TABLE rundown_modules
  DROP CONSTRAINT IF EXISTS rundown_modules_rundown_id_fkey,
  ADD CONSTRAINT rundown_modules_rundown_id_fkey 
    FOREIGN KEY (rundown_id) 
    REFERENCES event_rundowns(id) 
    ON DELETE CASCADE;

ALTER TABLE rundown_modules
  DROP CONSTRAINT IF EXISTS rundown_modules_assigned_to_fkey,
  ADD CONSTRAINT rundown_modules_assigned_to_fkey 
    FOREIGN KEY (assigned_to) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Business plan users
ALTER TABLE business_plan_users
  DROP CONSTRAINT IF EXISTS business_plan_users_invited_by_fkey,
  ADD CONSTRAINT business_plan_users_invited_by_fkey 
    FOREIGN KEY (invited_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Error logs
ALTER TABLE error_logs
  DROP CONSTRAINT IF EXISTS error_logs_user_id_fkey,
  ADD CONSTRAINT error_logs_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

ALTER TABLE error_logs
  DROP CONSTRAINT IF EXISTS error_logs_tenant_id_fkey,
  ADD CONSTRAINT error_logs_tenant_id_fkey 
    FOREIGN KEY (tenant_id) 
    REFERENCES church_tenants(id) 
    ON DELETE SET NULL;

-- ============================================
-- UNIQUE CONSTRAINTS
-- ============================================

-- Ensure email uniqueness per tenant
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_email_church_tenant_unique,
  ADD CONSTRAINT users_email_church_tenant_unique 
    UNIQUE (email, church_tenant_id);

-- Ensure church codes are unique
ALTER TABLE church_tenants
  DROP CONSTRAINT IF EXISTS church_tenants_church_code_unique,
  ADD CONSTRAINT church_tenants_church_code_unique 
    UNIQUE (church_code);

-- Ensure slugs are unique
ALTER TABLE church_tenants
  DROP CONSTRAINT IF EXISTS church_tenants_slug_unique,
  ADD CONSTRAINT church_tenants_slug_unique 
    UNIQUE (slug);

-- Ensure business plan user emails are unique
ALTER TABLE business_plan_users
  DROP CONSTRAINT IF EXISTS business_plan_users_email_unique,
  ADD CONSTRAINT business_plan_users_email_unique 
    UNIQUE (email);

-- Prevent duplicate team memberships
ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_team_user_unique,
  ADD CONSTRAINT team_members_team_user_unique 
    UNIQUE (team_id, user_id);

-- Prevent duplicate class enrollments
ALTER TABLE class_enrollments
  DROP CONSTRAINT IF EXISTS class_enrollments_class_user_unique,
  ADD CONSTRAINT class_enrollments_class_user_unique 
    UNIQUE (class_id, user_id);

-- ============================================
-- CHECK CONSTRAINTS
-- ============================================

-- Ensure event times are valid
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_time_check,
  ADD CONSTRAINT events_time_check 
    CHECK (end_time > start_time);

-- Ensure max attendees is positive
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_max_attendees_check,
  ADD CONSTRAINT events_max_attendees_check 
    CHECK (max_attendees IS NULL OR max_attendees > 0);

-- Ensure class capacity is positive
ALTER TABLE classes
  DROP CONSTRAINT IF EXISTS classes_max_capacity_check,
  ADD CONSTRAINT classes_max_capacity_check 
    CHECK (max_capacity IS NULL OR max_capacity > 0);

-- Ensure class dates are valid
ALTER TABLE classes
  DROP CONSTRAINT IF EXISTS classes_date_check,
  ADD CONSTRAINT classes_date_check 
    CHECK (end_date IS NULL OR end_date >= start_date);

-- Ensure rundown module duration is positive
ALTER TABLE rundown_modules
  DROP CONSTRAINT IF EXISTS rundown_modules_duration_check,
  ADD CONSTRAINT rundown_modules_duration_check 
    CHECK (duration_minutes > 0 AND duration_minutes <= 480);

-- Ensure order index is non-negative
ALTER TABLE rundown_modules
  DROP CONSTRAINT IF EXISTS rundown_modules_order_check,
  ADD CONSTRAINT rundown_modules_order_check 
    CHECK (order_index >= 0);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Create indexes on foreign keys for better query performance
CREATE INDEX IF NOT EXISTS idx_users_church_tenant ON users(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_church_tenant ON events(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_church_tenant ON classes(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_teams_church_tenant ON teams(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_church_tenant ON visitors(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_tenant ON error_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved) WHERE resolved = false;

COMMENT ON CONSTRAINT users_email_church_tenant_unique ON users IS 'Ensures email uniqueness within each church tenant';
COMMENT ON CONSTRAINT events_time_check ON events IS 'Ensures event end time is after start time';
COMMENT ON CONSTRAINT classes_date_check ON classes IS 'Ensures class end date is after or equal to start date';
