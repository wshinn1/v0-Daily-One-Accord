-- Add performance indexes for core tables only
-- This script adds indexes on frequently queried columns to improve performance

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_church_tenant_id ON users(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Church tenants table indexes
CREATE INDEX IF NOT EXISTS idx_church_tenants_subdomain ON church_tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_church_tenants_stripe_customer_id ON church_tenants(stripe_customer_id);

-- Visitors table indexes
CREATE INDEX IF NOT EXISTS idx_visitors_church_tenant_id ON visitors(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_assigned_to ON visitors(assigned_to);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_status ON visitors(church_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_created ON visitors(church_tenant_id, created_at DESC);

-- Slack integrations table indexes
CREATE INDEX IF NOT EXISTS idx_slack_integrations_church_tenant_id ON slack_integrations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_integrations_is_active ON slack_integrations(is_active);

SELECT 'Core performance indexes created successfully! ✅' as status;
