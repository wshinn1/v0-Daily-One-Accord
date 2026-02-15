-- Add performance indexes for multi-tenant queries
-- These indexes optimize queries filtered by church_tenant_id and other common patterns

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_church_tenant_id ON users(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Visitors table indexes
CREATE INDEX IF NOT EXISTS idx_visitors_church_tenant_id ON visitors(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_assigned_to ON visitors(assigned_to);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
-- Composite index for common query: get visitors by tenant and status
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_status ON visitors(church_tenant_id, status);
-- Composite index for assigned visitors
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_assigned ON visitors(church_tenant_id, assigned_to);

-- Church tenants table indexes
CREATE INDEX IF NOT EXISTS idx_church_tenants_stripe_customer_id ON church_tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_church_tenants_subscription_status ON church_tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_church_tenants_created_at ON church_tenants(created_at DESC);

-- Slack integrations table indexes
CREATE INDEX IF NOT EXISTS idx_slack_integrations_church_tenant_id ON slack_integrations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_integrations_is_active ON slack_integrations(is_active);

-- Rundowns table indexes
CREATE INDEX IF NOT EXISTS idx_rundowns_church_tenant_id ON rundowns(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_rundowns_event_date ON rundowns(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_rundowns_created_at ON rundowns(created_at DESC);
-- Composite index for getting recent rundowns by tenant
CREATE INDEX IF NOT EXISTS idx_rundowns_tenant_date ON rundowns(church_tenant_id, event_date DESC);

-- Attendance table indexes
CREATE INDEX IF NOT EXISTS idx_attendance_church_tenant_id ON attendance(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(created_at DESC);
-- Composite index for attendance by tenant and date
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON attendance(church_tenant_id, date DESC);

-- Classes table indexes
CREATE INDEX IF NOT EXISTS idx_classes_church_tenant_id ON classes(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_classes_start_date ON classes(start_date);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at DESC);

-- Class registrations table indexes
CREATE INDEX IF NOT EXISTS idx_class_registrations_class_id ON class_registrations(class_id);
CREATE INDEX IF NOT EXISTS idx_class_registrations_user_id ON class_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_class_registrations_created_at ON class_registrations(created_at DESC);

-- Invitations table indexes
CREATE INDEX IF NOT EXISTS idx_invitations_church_tenant_id ON invitations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);

-- Announcements table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_announcements_church_tenant_id ON announcements(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- Events table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_events_church_tenant_id ON events(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

-- Giving/donations table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_donations_church_tenant_id ON donations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount);

SELECT 'Performance indexes created successfully! ✅' as status;
