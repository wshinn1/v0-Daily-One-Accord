-- Add performance indexes for existing tables only
-- This improves query performance for tenant-scoped queries

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_church_tenant_id ON users(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Visitors table indexes
CREATE INDEX IF NOT EXISTS idx_visitors_church_tenant_id ON visitors(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_assigned_to ON visitors(assigned_to);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_status ON visitors(church_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_assigned ON visitors(church_tenant_id, assigned_to);

-- Church tenants table indexes
CREATE INDEX IF NOT EXISTS idx_church_tenants_created_at ON church_tenants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_church_tenants_subscription_status ON church_tenants(subscription_status);

-- Slack integrations table indexes
CREATE INDEX IF NOT EXISTS idx_slack_integrations_church_tenant_id ON slack_integrations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_integrations_is_active ON slack_integrations(is_active);

-- Invitations table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_invitations_church_tenant_id ON invitations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);

-- Attendance records table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_attendance_church_tenant_id ON attendance(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON attendance(church_tenant_id, date DESC);

-- Classes table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_classes_church_tenant_id ON classes(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);

-- Giving/donations table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_donations_church_tenant_id ON donations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_tenant_date ON donations(church_tenant_id, created_at DESC);

SELECT 'Performance indexes created successfully! ✅' as status;
