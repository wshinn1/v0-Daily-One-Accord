-- Performance Indexes for Daily One Accord
-- Optimizes queries for multi-tenant architecture at scale (100-1,000+ tenants)

-- ============================================================================
-- PRIMARY TENANT ISOLATION INDEXES
-- These ensure fast filtering by church_tenant_id across all tables
-- ============================================================================

-- Core tables with high query volume
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_tenant ON visitors(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant ON attendance(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_teams_tenant ON teams(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_classes_tenant ON classes(church_tenant_id);

-- Communication tables
CREATE INDEX IF NOT EXISTS idx_sms_logs_tenant ON sms_logs(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_tenant ON newsletters(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sms_tenant ON bulk_sms_campaigns(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_tenant ON scheduled_sms(church_tenant_id);

-- Ministry and volunteer tables
CREATE INDEX IF NOT EXISTS idx_ministry_teams_tenant ON ministry_teams(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_teams_tenant ON volunteer_teams(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_service_team_categories_tenant ON service_team_categories(church_tenant_id);

-- Event and rundown tables
CREATE INDEX IF NOT EXISTS idx_event_rundowns_tenant ON event_rundowns(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_categories_tenant ON attendance_categories(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_by_category_tenant ON attendance_by_category(church_tenant_id);

-- Integration tables
CREATE INDEX IF NOT EXISTS idx_slack_integrations_tenant ON slack_integrations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_tenant ON slack_workspaces(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_tenant ON slack_messages(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_bot_configs_tenant ON slack_bot_configs(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_attendance_fields_tenant ON slack_attendance_form_fields(church_tenant_id);

-- Template and configuration tables
CREATE INDEX IF NOT EXISTS idx_email_templates_tenant ON email_templates(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_tenant ON custom_roles(church_tenant_id);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- These optimize frequently used WHERE clauses with multiple conditions
-- ============================================================================

-- Events: Filter by tenant + date range (most common query)
CREATE INDEX IF NOT EXISTS idx_events_tenant_start ON events(church_tenant_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_events_tenant_type ON events(church_tenant_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_tenant_public ON events(church_tenant_id, is_public) WHERE is_public = true;

-- Visitors: Filter by tenant + status (kanban board queries)
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_status ON visitors(church_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_assigned ON visitors(church_tenant_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_created ON visitors(church_tenant_id, created_at DESC);

-- Attendance: Filter by tenant + event + user
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_event ON attendance(church_tenant_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_user ON attendance(church_tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON attendance(church_tenant_id, attended_at DESC);

-- Classes: Filter by tenant + active status
CREATE INDEX IF NOT EXISTS idx_classes_tenant_active ON classes(church_tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_classes_tenant_teacher ON classes(church_tenant_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_tenant_dates ON classes(church_tenant_id, start_date, end_date);

-- SMS Logs: Filter by tenant + status + date
CREATE INDEX IF NOT EXISTS idx_sms_logs_tenant_status ON sms_logs(church_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_tenant_created ON sms_logs(church_tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_tenant_recipient ON sms_logs(church_tenant_id, recipient_id);

-- Event Rundowns: Filter by tenant + date + status
CREATE INDEX IF NOT EXISTS idx_rundowns_tenant_date ON event_rundowns(church_tenant_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_rundowns_tenant_status ON event_rundowns(church_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_rundowns_tenant_archived ON event_rundowns(church_tenant_id, is_archived) WHERE is_archived = false;

-- Scheduled SMS: Filter by tenant + status + scheduled time
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_tenant_status ON scheduled_sms(church_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_tenant_scheduled ON scheduled_sms(church_tenant_id, scheduled_for);

-- ============================================================================
-- FOREIGN KEY INDEXES
-- These optimize JOIN operations and relationship queries
-- ============================================================================

-- User relationships
CREATE INDEX IF NOT EXISTS idx_church_members_user ON church_members(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ministry_team_members_user ON ministry_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_team_members_user ON volunteer_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_user ON class_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_user ON class_attendance(user_id);

-- Event relationships
CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_event ON scheduled_sms(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_by_category_event ON attendance_by_category(event_id);

-- Rundown relationships
CREATE INDEX IF NOT EXISTS idx_rundown_modules_rundown ON rundown_modules(rundown_id);
CREATE INDEX IF NOT EXISTS idx_rundown_team_assignments_rundown ON rundown_team_assignments(rundown_id);
CREATE INDEX IF NOT EXISTS idx_worship_songs_rundown ON worship_songs(rundown_id);

-- Class relationships
CREATE INDEX IF NOT EXISTS idx_class_sessions_class ON class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_session ON class_attendance(session_id);

-- Team relationships
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_ministry_team_members_team ON ministry_team_members(ministry_team_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_team_members_team ON volunteer_team_members(volunteer_team_id);

-- Integration relationships
CREATE INDEX IF NOT EXISTS idx_slack_channels_integration ON slack_channels(slack_integration_id);

-- ============================================================================
-- LOOKUP INDEXES FOR UNIQUE IDENTIFIERS
-- These optimize lookups by email, phone, codes, and tokens
-- ============================================================================

-- User lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Church tenant lookups
CREATE INDEX IF NOT EXISTS idx_church_tenants_slug ON church_tenants(slug);
CREATE INDEX IF NOT EXISTS idx_church_tenants_code ON church_tenants(church_code);

-- Visitor lookups
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email);
CREATE INDEX IF NOT EXISTS idx_visitors_phone ON visitors(phone);

-- Event registration lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);

-- Invitation lookups
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);

-- Slack lookups
CREATE INDEX IF NOT EXISTS idx_church_members_slack_user ON church_members(slack_user_id);
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_team ON slack_workspaces(team_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_ts ON slack_messages(message_ts);

-- SMS lookups
CREATE INDEX IF NOT EXISTS idx_sms_logs_telnyx ON sms_logs(telnyx_message_id);

-- ============================================================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- These optimize queries that frequently filter on specific values
-- ============================================================================

-- Active records only
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(church_tenant_id, created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_team_categories_active ON service_team_categories(church_tenant_id, order_index) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_slack_attendance_fields_active ON slack_attendance_form_fields(church_tenant_id, display_order) WHERE is_active = true;

-- Pending/processing records
CREATE INDEX IF NOT EXISTS idx_scheduled_sms_pending ON scheduled_sms(church_tenant_id, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_bulk_sms_processing ON bulk_sms_campaigns(church_tenant_id, created_at DESC) WHERE status IN ('pending', 'processing');

-- Removed problematic index with NOW() function - cannot use VOLATILE functions in index predicates
-- Public events (without time filter - filter in application code instead)
CREATE INDEX IF NOT EXISTS idx_events_public ON events(church_tenant_id, start_time DESC) WHERE is_public = true;

-- Super admins
CREATE INDEX IF NOT EXISTS idx_users_super_admin ON users(id) WHERE is_super_admin = true;

-- ============================================================================
-- ORDERING INDEXES
-- These optimize ORDER BY clauses in common queries
-- ============================================================================

-- Timestamp ordering (most recent first)
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_created ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_sent ON newsletters(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_attended ON attendance(attended_at DESC);

-- Custom ordering
CREATE INDEX IF NOT EXISTS idx_rundown_modules_order ON rundown_modules(rundown_id, order_index);
CREATE INDEX IF NOT EXISTS idx_worship_songs_order ON worship_songs(rundown_id, order_index);
CREATE INDEX IF NOT EXISTS idx_service_team_categories_order ON service_team_categories(church_tenant_id, order_index);
CREATE INDEX IF NOT EXISTS idx_attendance_categories_order ON attendance_categories(church_tenant_id, display_order);
CREATE INDEX IF NOT EXISTS idx_slack_attendance_fields_order ON slack_attendance_form_fields(church_tenant_id, display_order);
CREATE INDEX IF NOT EXISTS idx_visitors_position ON visitors(church_tenant_id, position);

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- These indexes are designed to support:
-- 1. Multi-tenant isolation (every query filters by church_tenant_id)
-- 2. Common dashboard queries (recent events, visitors, attendance)
-- 3. Kanban board operations (visitors by status)
-- 4. Calendar views (events by date range)
-- 5. Reporting queries (attendance analytics, SMS logs)
-- 6. Real-time features (Slack integration, SMS sending)

-- Expected performance improvements:
-- - 5-50 tenants: 2-5x faster queries
-- - 50-250 tenants: 5-10x faster queries
-- - 250-1,000 tenants: 10-50x faster queries

-- Index maintenance:
-- - PostgreSQL automatically maintains these indexes
-- - VACUUM and ANALYZE run automatically on Supabase
-- - Monitor slow queries in Supabase dashboard
-- - Add new indexes as usage patterns emerge
