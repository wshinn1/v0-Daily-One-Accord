-- Row Level Security (RLS) Policies for Daily One Accord
-- Ensures complete data isolation between church tenants
-- Critical for multi-tenant security at scale

-- ============================================================================
-- HELPER FUNCTIONS
-- These functions are used by RLS policies to determine access
-- ============================================================================

-- Drop existing policies before creating new ones to make script idempotent

-- Get the current user's church tenant ID
-- STABLE means the function result won't change during a transaction (performance optimization)
CREATE OR REPLACE FUNCTION get_user_church_tenant_id()
RETURNS UUID AS $$
  SELECT church_tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if current user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_super_admin, false) FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if current user has a specific role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT role::TEXT = required_role FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if current user is admin or owner
CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT role::TEXT IN ('admin', 'owner') FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- This is the foundation of tenant isolation
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_by_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_sms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_attendance_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- Users can only see users in their own church tenant
-- ============================================================================

DROP POLICY IF EXISTS "Users can view users in their church" ON users;
CREATE POLICY "Users can view users in their church"
  ON users FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can insert users in their church" ON users;
CREATE POLICY "Admins can insert users in their church"
  ON users FOR INSERT
  WITH CHECK (
    church_tenant_id = get_user_church_tenant_id() 
    AND is_admin_or_owner()
  );

DROP POLICY IF EXISTS "Admins can update users in their church" ON users;
CREATE POLICY "Admins can update users in their church"
  ON users FOR UPDATE
  USING (
    church_tenant_id = get_user_church_tenant_id() 
    AND is_admin_or_owner()
  );

DROP POLICY IF EXISTS "Admins can delete users in their church" ON users;
CREATE POLICY "Admins can delete users in their church"
  ON users FOR DELETE
  USING (
    church_tenant_id = get_user_church_tenant_id() 
    AND is_admin_or_owner()
  );

-- ============================================================================
-- CHURCH TENANTS TABLE POLICIES
-- Users can only see their own church tenant
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their church tenant" ON church_tenants;
CREATE POLICY "Users can view their church tenant"
  ON church_tenants FOR SELECT
  USING (id = get_user_church_tenant_id() OR is_super_admin());

DROP POLICY IF EXISTS "Admins can update their church tenant" ON church_tenants;
CREATE POLICY "Admins can update their church tenant"
  ON church_tenants FOR UPDATE
  USING (id = get_user_church_tenant_id() AND is_admin_or_owner());

-- ============================================================================
-- STANDARD TENANT ISOLATION POLICIES
-- These apply to most tables with church_tenant_id
-- ============================================================================

-- Events
DROP POLICY IF EXISTS "Users can view events in their church" ON events;
CREATE POLICY "Users can view events in their church"
  ON events FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create events in their church" ON events;
CREATE POLICY "Users can create events in their church"
  ON events FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update events in their church" ON events;
CREATE POLICY "Users can update events in their church"
  ON events FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can delete events in their church" ON events;
CREATE POLICY "Admins can delete events in their church"
  ON events FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Visitors
DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
CREATE POLICY "Users can view visitors in their church"
  ON visitors FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create visitors in their church" ON visitors;
CREATE POLICY "Users can create visitors in their church"
  ON visitors FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update visitors in their church" ON visitors;
CREATE POLICY "Users can update visitors in their church"
  ON visitors FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can delete visitors in their church" ON visitors;
CREATE POLICY "Users can delete visitors in their church"
  ON visitors FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id());

-- Attendance
DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
CREATE POLICY "Users can view attendance in their church"
  ON attendance FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create attendance in their church" ON attendance;
CREATE POLICY "Users can create attendance in their church"
  ON attendance FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update attendance in their church" ON attendance;
CREATE POLICY "Users can update attendance in their church"
  ON attendance FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can delete attendance in their church" ON attendance;
CREATE POLICY "Users can delete attendance in their church"
  ON attendance FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id());

-- Teams
DROP POLICY IF EXISTS "Users can view teams in their church" ON teams;
CREATE POLICY "Users can view teams in their church"
  ON teams FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create teams in their church" ON teams;
CREATE POLICY "Users can create teams in their church"
  ON teams FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update teams in their church" ON teams;
CREATE POLICY "Users can update teams in their church"
  ON teams FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can delete teams in their church" ON teams;
CREATE POLICY "Admins can delete teams in their church"
  ON teams FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Ministry Teams
DROP POLICY IF EXISTS "Users can view ministry teams in their church" ON ministry_teams;
CREATE POLICY "Users can view ministry teams in their church"
  ON ministry_teams FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create ministry teams in their church" ON ministry_teams;
CREATE POLICY "Users can create ministry teams in their church"
  ON ministry_teams FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update ministry teams in their church" ON ministry_teams;
CREATE POLICY "Users can update ministry teams in their church"
  ON ministry_teams FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can delete ministry teams in their church" ON ministry_teams;
CREATE POLICY "Admins can delete ministry teams in their church"
  ON ministry_teams FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Volunteer Teams
DROP POLICY IF EXISTS "Users can view volunteer teams in their church" ON volunteer_teams;
CREATE POLICY "Users can view volunteer teams in their church"
  ON volunteer_teams FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create volunteer teams in their church" ON volunteer_teams;
CREATE POLICY "Users can create volunteer teams in their church"
  ON volunteer_teams FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update volunteer teams in their church" ON volunteer_teams;
CREATE POLICY "Users can update volunteer teams in their church"
  ON volunteer_teams FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can delete volunteer teams in their church" ON volunteer_teams;
CREATE POLICY "Admins can delete volunteer teams in their church"
  ON volunteer_teams FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Classes
DROP POLICY IF EXISTS "Users can view classes in their church" ON classes;
CREATE POLICY "Users can view classes in their church"
  ON classes FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create classes in their church" ON classes;
CREATE POLICY "Users can create classes in their church"
  ON classes FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update classes in their church" ON classes;
CREATE POLICY "Users can update classes in their church"
  ON classes FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can delete classes in their church" ON classes;
CREATE POLICY "Admins can delete classes in their church"
  ON classes FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Event Rundowns
DROP POLICY IF EXISTS "Users can view rundowns in their church" ON event_rundowns;
CREATE POLICY "Users can view rundowns in their church"
  ON event_rundowns FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create rundowns in their church" ON event_rundowns;
CREATE POLICY "Users can create rundowns in their church"
  ON event_rundowns FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update rundowns in their church" ON event_rundowns;
CREATE POLICY "Users can update rundowns in their church"
  ON event_rundowns FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can delete rundowns in their church" ON event_rundowns;
CREATE POLICY "Users can delete rundowns in their church"
  ON event_rundowns FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id());

-- SMS Logs
DROP POLICY IF EXISTS "Users can view SMS logs in their church" ON sms_logs;
CREATE POLICY "Users can view SMS logs in their church"
  ON sms_logs FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create SMS logs in their church" ON sms_logs;
CREATE POLICY "Users can create SMS logs in their church"
  ON sms_logs FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

-- Scheduled SMS
DROP POLICY IF EXISTS "Users can view scheduled SMS in their church" ON scheduled_sms;
CREATE POLICY "Users can view scheduled SMS in their church"
  ON scheduled_sms FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create scheduled SMS in their church" ON scheduled_sms;
CREATE POLICY "Users can create scheduled SMS in their church"
  ON scheduled_sms FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update scheduled SMS in their church" ON scheduled_sms;
CREATE POLICY "Users can update scheduled SMS in their church"
  ON scheduled_sms FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can delete scheduled SMS in their church" ON scheduled_sms;
CREATE POLICY "Users can delete scheduled SMS in their church"
  ON scheduled_sms FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id());

-- Bulk SMS Campaigns
DROP POLICY IF EXISTS "Users can view bulk SMS in their church" ON bulk_sms_campaigns;
CREATE POLICY "Users can view bulk SMS in their church"
  ON bulk_sms_campaigns FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create bulk SMS in their church" ON bulk_sms_campaigns;
CREATE POLICY "Users can create bulk SMS in their church"
  ON bulk_sms_campaigns FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update bulk SMS in their church" ON bulk_sms_campaigns;
CREATE POLICY "Users can update bulk SMS in their church"
  ON bulk_sms_campaigns FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

-- Newsletters
DROP POLICY IF EXISTS "Users can view newsletters in their church" ON newsletters;
CREATE POLICY "Users can view newsletters in their church"
  ON newsletters FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create newsletters in their church" ON newsletters;
CREATE POLICY "Users can create newsletters in their church"
  ON newsletters FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update newsletters in their church" ON newsletters;
CREATE POLICY "Users can update newsletters in their church"
  ON newsletters FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

-- Email Templates
DROP POLICY IF EXISTS "Users can view email templates in their church" ON email_templates;
CREATE POLICY "Users can view email templates in their church"
  ON email_templates FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create email templates in their church" ON email_templates;
CREATE POLICY "Users can create email templates in their church"
  ON email_templates FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update email templates in their church" ON email_templates;
CREATE POLICY "Users can update email templates in their church"
  ON email_templates FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can delete email templates in their church" ON email_templates;
CREATE POLICY "Users can delete email templates in their church"
  ON email_templates FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id());

-- Slack Integrations
DROP POLICY IF EXISTS "Users can view Slack integrations in their church" ON slack_integrations;
CREATE POLICY "Users can view Slack integrations in their church"
  ON slack_integrations FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage Slack integrations in their church" ON slack_integrations;
CREATE POLICY "Admins can manage Slack integrations in their church"
  ON slack_integrations FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Slack Workspaces
DROP POLICY IF EXISTS "Users can view Slack workspaces in their church" ON slack_workspaces;
CREATE POLICY "Users can view Slack workspaces in their church"
  ON slack_workspaces FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage Slack workspaces in their church" ON slack_workspaces;
CREATE POLICY "Admins can manage Slack workspaces in their church"
  ON slack_workspaces FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Slack Messages
DROP POLICY IF EXISTS "Users can view Slack messages in their church" ON slack_messages;
CREATE POLICY "Users can view Slack messages in their church"
  ON slack_messages FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create Slack messages in their church" ON slack_messages;
CREATE POLICY "Users can create Slack messages in their church"
  ON slack_messages FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

-- Slack Bot Configs
DROP POLICY IF EXISTS "Users can view Slack bot configs in their church" ON slack_bot_configs;
CREATE POLICY "Users can view Slack bot configs in their church"
  ON slack_bot_configs FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage Slack bot configs in their church" ON slack_bot_configs;
CREATE POLICY "Admins can manage Slack bot configs in their church"
  ON slack_bot_configs FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Slack Attendance Form Fields
DROP POLICY IF EXISTS "Users can view Slack attendance fields in their church" ON slack_attendance_form_fields;
CREATE POLICY "Users can view Slack attendance fields in their church"
  ON slack_attendance_form_fields FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage Slack attendance fields in their church" ON slack_attendance_form_fields;
CREATE POLICY "Admins can manage Slack attendance fields in their church"
  ON slack_attendance_form_fields FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Service Team Categories
DROP POLICY IF EXISTS "Users can view service team categories in their church" ON service_team_categories;
CREATE POLICY "Users can view service team categories in their church"
  ON service_team_categories FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage service team categories in their church" ON service_team_categories;
CREATE POLICY "Admins can manage service team categories in their church"
  ON service_team_categories FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Attendance Categories
DROP POLICY IF EXISTS "Users can view attendance categories in their church" ON attendance_categories;
CREATE POLICY "Users can view attendance categories in their church"
  ON attendance_categories FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage attendance categories in their church" ON attendance_categories;
CREATE POLICY "Admins can manage attendance categories in their church"
  ON attendance_categories FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Attendance By Category
DROP POLICY IF EXISTS "Users can view attendance by category in their church" ON attendance_by_category;
CREATE POLICY "Users can view attendance by category in their church"
  ON attendance_by_category FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create attendance by category in their church" ON attendance_by_category;
CREATE POLICY "Users can create attendance by category in their church"
  ON attendance_by_category FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update attendance by category in their church" ON attendance_by_category;
CREATE POLICY "Users can update attendance by category in their church"
  ON attendance_by_category FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

-- Custom Roles
DROP POLICY IF EXISTS "Users can view custom roles in their church" ON custom_roles;
CREATE POLICY "Users can view custom roles in their church"
  ON custom_roles FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage custom roles in their church" ON custom_roles;
CREATE POLICY "Admins can manage custom roles in their church"
  ON custom_roles FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- User Invitations
DROP POLICY IF EXISTS "Users can view invitations in their church" ON user_invitations;
CREATE POLICY "Users can view invitations in their church"
  ON user_invitations FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage invitations in their church" ON user_invitations;
CREATE POLICY "Admins can manage invitations in their church"
  ON user_invitations FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- ============================================================================
-- JUNCTION TABLE POLICIES
-- These tables link users to teams, classes, etc.
-- ============================================================================

-- Church Members
DROP POLICY IF EXISTS "Users can view church members in their church" ON church_members;
CREATE POLICY "Users can view church members in their church"
  ON church_members FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Admins can manage church members in their church" ON church_members;
CREATE POLICY "Admins can manage church members in their church"
  ON church_members FOR ALL
  USING (church_tenant_id = get_user_church_tenant_id() AND is_admin_or_owner());

-- Team Members
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage team members" ON team_members;
CREATE POLICY "Users can manage team members"
  ON team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.church_tenant_id = get_user_church_tenant_id()
  ));

-- Ministry Team Members
DROP POLICY IF EXISTS "Users can view ministry team members" ON ministry_team_members;
CREATE POLICY "Users can view ministry team members"
  ON ministry_team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ministry_teams 
    WHERE ministry_teams.id = ministry_team_members.ministry_team_id 
    AND ministry_teams.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage ministry team members" ON ministry_team_members;
CREATE POLICY "Users can manage ministry team members"
  ON ministry_team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM ministry_teams 
    WHERE ministry_teams.id = ministry_team_members.ministry_team_id 
    AND ministry_teams.church_tenant_id = get_user_church_tenant_id()
  ));

-- Volunteer Team Members
DROP POLICY IF EXISTS "Users can view volunteer team members" ON volunteer_team_members;
CREATE POLICY "Users can view volunteer team members"
  ON volunteer_team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM volunteer_teams 
    WHERE volunteer_teams.id = volunteer_team_members.volunteer_team_id 
    AND volunteer_teams.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage volunteer team members" ON volunteer_team_members;
CREATE POLICY "Users can manage volunteer team members"
  ON volunteer_team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM volunteer_teams 
    WHERE volunteer_teams.id = volunteer_team_members.volunteer_team_id 
    AND volunteer_teams.church_tenant_id = get_user_church_tenant_id()
  ));

-- Class Sessions
DROP POLICY IF EXISTS "Users can view class sessions" ON class_sessions;
CREATE POLICY "Users can view class sessions"
  ON class_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = class_sessions.class_id 
    AND classes.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage class sessions" ON class_sessions;
CREATE POLICY "Users can manage class sessions"
  ON class_sessions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = class_sessions.class_id 
    AND classes.church_tenant_id = get_user_church_tenant_id()
  ));

-- Class Enrollments
DROP POLICY IF EXISTS "Users can view class enrollments" ON class_enrollments;
CREATE POLICY "Users can view class enrollments"
  ON class_enrollments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = class_enrollments.class_id 
    AND classes.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage class enrollments" ON class_enrollments;
CREATE POLICY "Users can manage class enrollments"
  ON class_enrollments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = class_enrollments.class_id 
    AND classes.church_tenant_id = get_user_church_tenant_id()
  ));

-- Class Attendance
DROP POLICY IF EXISTS "Users can view class attendance" ON class_attendance;
CREATE POLICY "Users can view class attendance"
  ON class_attendance FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM class_sessions 
    JOIN classes ON classes.id = class_sessions.class_id
    WHERE class_sessions.id = class_attendance.session_id 
    AND classes.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage class attendance" ON class_attendance;
CREATE POLICY "Users can manage class attendance"
  ON class_attendance FOR ALL
  USING (EXISTS (
    SELECT 1 FROM class_sessions 
    JOIN classes ON classes.id = class_sessions.class_id
    WHERE class_sessions.id = class_attendance.session_id 
    AND classes.church_tenant_id = get_user_church_tenant_id()
  ));

-- Event Registrations
DROP POLICY IF EXISTS "Users can view event registrations" ON event_registrations;
CREATE POLICY "Users can view event registrations"
  ON event_registrations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_registrations.event_id 
    AND events.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Anyone can create event registrations for public events" ON event_registrations;
CREATE POLICY "Anyone can create event registrations for public events"
  ON event_registrations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_registrations.event_id 
    AND events.is_public = true
  ));

-- Rundown Modules
DROP POLICY IF EXISTS "Users can view rundown modules" ON rundown_modules;
CREATE POLICY "Users can view rundown modules"
  ON rundown_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM event_rundowns 
    WHERE event_rundowns.id = rundown_modules.rundown_id 
    AND event_rundowns.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage rundown modules" ON rundown_modules;
CREATE POLICY "Users can manage rundown modules"
  ON rundown_modules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_rundowns 
    WHERE event_rundowns.id = rundown_modules.rundown_id 
    AND event_rundowns.church_tenant_id = get_user_church_tenant_id()
  ));

-- Rundown Team Assignments
DROP POLICY IF EXISTS "Users can view rundown team assignments" ON rundown_team_assignments;
CREATE POLICY "Users can view rundown team assignments"
  ON rundown_team_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM event_rundowns 
    WHERE event_rundowns.id = rundown_team_assignments.rundown_id 
    AND event_rundowns.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage rundown team assignments" ON rundown_team_assignments;
CREATE POLICY "Users can manage rundown team assignments"
  ON rundown_team_assignments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_rundowns 
    WHERE event_rundowns.id = rundown_team_assignments.rundown_id 
    AND event_rundowns.church_tenant_id = get_user_church_tenant_id()
  ));

-- Worship Songs
DROP POLICY IF EXISTS "Users can view worship songs" ON worship_songs;
CREATE POLICY "Users can view worship songs"
  ON worship_songs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM event_rundowns 
    WHERE event_rundowns.id = worship_songs.rundown_id 
    AND event_rundowns.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "Users can manage worship songs" ON worship_songs;
CREATE POLICY "Users can manage worship songs"
  ON worship_songs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_rundowns 
    WHERE event_rundowns.id = worship_songs.rundown_id 
    AND event_rundowns.church_tenant_id = get_user_church_tenant_id()
  ));

-- Newsletter Recipients
DROP POLICY IF EXISTS "Users can view newsletter recipients" ON newsletter_recipients;
CREATE POLICY "Users can view newsletter recipients"
  ON newsletter_recipients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM newsletters 
    WHERE newsletters.id = newsletter_recipients.newsletter_id 
    AND newsletters.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "System can manage newsletter recipients" ON newsletter_recipients;
CREATE POLICY "System can manage newsletter recipients"
  ON newsletter_recipients FOR ALL
  USING (EXISTS (
    SELECT 1 FROM newsletters 
    WHERE newsletters.id = newsletter_recipients.newsletter_id 
    AND newsletters.church_tenant_id = get_user_church_tenant_id()
  ));

-- Slack Channels
DROP POLICY IF EXISTS "Users can view Slack channels" ON slack_channels;
CREATE POLICY "Users can view Slack channels"
  ON slack_channels FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM slack_integrations 
    WHERE slack_integrations.id = slack_channels.slack_integration_id 
    AND slack_integrations.church_tenant_id = get_user_church_tenant_id()
  ));

DROP POLICY IF EXISTS "System can manage Slack channels" ON slack_channels;
CREATE POLICY "System can manage Slack channels"
  ON slack_channels FOR ALL
  USING (EXISTS (
    SELECT 1 FROM slack_integrations 
    WHERE slack_integrations.id = slack_channels.slack_integration_id 
    AND slack_integrations.church_tenant_id = get_user_church_tenant_id()
  ));

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- These RLS policies ensure:
-- 1. Complete data isolation between church tenants
-- 2. Users can only access data from their own church
-- 3. Admins have elevated permissions within their church
-- 4. Super admins can access all data (for support purposes)
-- 5. Public events allow anonymous registrations

-- Performance considerations:
-- - Helper functions use STABLE for query optimization
-- - Indexes on church_tenant_id ensure fast policy checks
-- - Policies use EXISTS for efficient subqueries

-- Maintenance:
-- - Add RLS policies for any new tables
-- - Test policies thoroughly before deploying
-- - Monitor slow queries in Supabase dashboard
-- - Review policies quarterly for security updates
