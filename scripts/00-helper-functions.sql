-- Helper Functions for Daily One Accord
-- Must be run FIRST before other scripts
-- These functions support Row Level Security and query optimization

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

-- Get the current user's church tenant ID
-- STABLE means it won't change during a transaction (better performance than VOLATILE)
CREATE OR REPLACE FUNCTION get_user_church_tenant_id()
RETURNS UUID AS $$
  SELECT church_tenant_id 
  FROM users 
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if current user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM users WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if current user has a specific role in their church
-- Added explicit type cast for role comparison
CREATE OR REPLACE FUNCTION user_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND church_tenant_id = get_user_church_tenant_id()
    AND role::text = role_name
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if current user is a member of a specific church
CREATE OR REPLACE FUNCTION is_church_member(tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND church_tenant_id = tenant_id
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Generate a unique slug from a name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
  SELECT lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
$$ LANGUAGE SQL IMMUTABLE;

-- Generate a random church code (6 characters)
CREATE OR REPLACE FUNCTION generate_church_code()
RETURNS TEXT AS $$
  SELECT upper(substring(md5(random()::text) from 1 for 6));
$$ LANGUAGE SQL VOLATILE;

-- ============================================================================
-- TIMESTAMP FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES
-- ============================================================================

-- Function Volatility Categories:
-- - IMMUTABLE: Always returns same result for same input (e.g., math functions)
-- - STABLE: Returns same result within a transaction (e.g., current user queries)
-- - VOLATILE: Can return different results on successive calls (e.g., random())

-- STABLE is used for RLS functions because:
-- 1. The current user doesn't change during a transaction
-- 2. Better performance than VOLATILE (can be optimized by query planner)
-- 3. Safe for use in indexes and WHERE clauses
