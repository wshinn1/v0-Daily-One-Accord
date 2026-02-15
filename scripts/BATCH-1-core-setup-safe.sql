-- =====================================================
-- BATCH 1: CORE SETUP (Scripts 1-8)
-- Safe version that handles existing objects
-- =====================================================

-- =====================================================
-- SCRIPT 01: Setup Database Schema
-- =====================================================

-- Drop existing types if they exist (safe for fresh setup)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS visitor_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('super_admin', 'lead_admin', 'admin_staff', 'volunteer', 'member');
CREATE TYPE visitor_status AS ENUM ('new', 'contacted', 'following_up', 'connected', 'inactive');
CREATE TYPE event_type AS ENUM ('service', 'meeting', 'outreach', 'social', 'other');

-- Create tables with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'member',
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  date_of_birth DATE,
  membership_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type DEFAULT 'other',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES church_members(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  visit_date DATE NOT NULL,
  status visitor_status DEFAULT 'new',
  source TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  member_id UUID REFERENCES church_members(id) ON DELETE CASCADE,
  joined_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, member_id)
);

CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_date TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SCRIPT 02: Setup Row Level Security
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own church tenant" ON church_tenants;
DROP POLICY IF EXISTS "Users can update their own church tenant" ON church_tenants;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view members in their church" ON church_members;
DROP POLICY IF EXISTS "Admins can manage members" ON church_members;
DROP POLICY IF EXISTS "Users can view events in their church" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can view attendance in their church" ON event_attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON event_attendance;
DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Admins can manage visitors" ON visitors;
DROP POLICY IF EXISTS "Users can view teams in their church" ON teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members in their church" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view newsletters in their church" ON newsletters;
DROP POLICY IF EXISTS "Admins can manage newsletters" ON newsletters;

-- Church Tenants policies
CREATE POLICY "Users can view their own church tenant"
  ON church_tenants FOR SELECT
  USING (id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own church tenant"
  ON church_tenants FOR UPDATE
  USING (id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')));

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid() OR church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Church Members policies
CREATE POLICY "Users can view members in their church"
  ON church_members FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage members"
  ON church_members FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
  ));

-- Events policies
CREATE POLICY "Users can view events in their church"
  ON events FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
  ));

-- Event Attendance policies
CREATE POLICY "Users can view attendance in their church"
  ON event_attendance FOR SELECT
  USING (event_id IN (
    SELECT id FROM events WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Admins can manage attendance"
  ON event_attendance FOR ALL
  USING (event_id IN (
    SELECT id FROM events WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
    )
  ));

-- Visitors policies
CREATE POLICY "Users can view visitors in their church"
  ON visitors FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage visitors"
  ON visitors FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
  ));

-- Teams policies
CREATE POLICY "Users can view teams in their church"
  ON teams FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage teams"
  ON teams FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
  ));

-- Team Members policies
CREATE POLICY "Users can view team members in their church"
  ON team_members FOR SELECT
  USING (team_id IN (
    SELECT id FROM teams WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING (team_id IN (
    SELECT id FROM teams WHERE church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
    )
  ));

-- Newsletters policies
CREATE POLICY "Users can view newsletters in their church"
  ON newsletters FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage newsletters"
  ON newsletters FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
  ));

-- =====================================================
-- SCRIPT 03: Seed Initial Data (Optional - Skip if not needed)
-- =====================================================

-- This script is typically for demo data, skip for production

-- =====================================================
-- SCRIPT 04: Fix Signup RLS Policy
-- =====================================================

DROP POLICY IF EXISTS "Allow user creation during signup" ON users;

CREATE POLICY "Allow user creation during signup"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- =====================================================
-- SCRIPT 05: Create User Profile Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SCRIPT 06: Add Super Admin Manually (Update with your email)
-- =====================================================

-- Replace 'your-email@example.com' with your actual email
-- UPDATE users SET is_super_admin = TRUE WHERE email = 'your-email@example.com';

-- =====================================================
-- SCRIPT 07: Fix Super Admin and RLS
-- =====================================================

DROP POLICY IF EXISTS "Super admins can view all church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can manage all church tenants" ON church_tenants;

CREATE POLICY "Super admins can view all church tenants"
  ON church_tenants FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE)
    OR id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Super admins can manage all church tenants"
  ON church_tenants FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE)
  );

-- =====================================================
-- SCRIPT 08: Fix Super Admin RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;

CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE)
    OR id = auth.uid()
    OR church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Super admins can manage all users"
  ON users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE)
  );

-- =====================================================
-- BATCH 1 COMPLETE
-- =====================================================
