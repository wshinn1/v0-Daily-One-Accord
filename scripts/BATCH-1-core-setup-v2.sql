-- ============================================
-- BATCH 1: Core Database Setup (Scripts 1-8)
-- ============================================
-- This batch creates the foundational database schema,
-- RLS policies, and user management system.
-- Safe to run even if some objects already exist.

-- ============================================
-- Script 01: Setup Database Schema
-- ============================================

-- Create ENUM types with error handling
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'lead_admin', 'admin_staff', 'volunteer', 'member');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visitor_status') THEN
        CREATE TYPE visitor_status AS ENUM ('new', 'contacted', 'follow_up', 'member');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_type') THEN
        CREATE TYPE team_type AS ENUM ('ministry', 'volunteer');
    END IF;
END $$;

-- Create church_tenants table
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
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

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status visitor_status DEFAULT 'new',
  notes TEXT,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type team_type NOT NULL,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT TRUE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create church_members table
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, church_tenant_id)
);

-- ============================================
-- Script 02: Setup Row Level Security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own church tenant" ON church_tenants;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view events in their church" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Admins can manage visitors" ON visitors;
DROP POLICY IF EXISTS "Users can view teams in their church" ON teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Users can view newsletters in their church" ON newsletters;
DROP POLICY IF EXISTS "Admins can manage newsletters" ON newsletters;
DROP POLICY IF EXISTS "Users can view church members" ON church_members;
DROP POLICY IF EXISTS "Admins can manage church members" ON church_members;

-- Church Tenants policies
CREATE POLICY "Users can view their own church tenant"
  ON church_tenants FOR SELECT
  USING (id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid() OR church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Events policies
CREATE POLICY "Users can view events in their church"
  ON events FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('super_admin', 'lead_admin', 'admin_staff')
  ));

-- Visitors policies
CREATE POLICY "Users can view visitors in their church"
  ON visitors FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage visitors"
  ON visitors FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('super_admin', 'lead_admin', 'admin_staff')
  ));

-- Teams policies
CREATE POLICY "Users can view teams in their church"
  ON teams FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage teams"
  ON teams FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('super_admin', 'lead_admin', 'admin_staff')
  ));

-- Team Members policies
CREATE POLICY "Users can view team members"
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
      WHERE id = auth.uid() AND role IN ('super_admin', 'lead_admin', 'admin_staff')
    )
  ));

-- Attendance policies
CREATE POLICY "Users can view attendance in their church"
  ON attendance FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage attendance"
  ON attendance FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('super_admin', 'lead_admin', 'admin_staff')
  ));

-- Newsletters policies
CREATE POLICY "Users can view newsletters in their church"
  ON newsletters FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage newsletters"
  ON newsletters FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('super_admin', 'lead_admin', 'admin_staff')
  ));

-- Church Members policies
CREATE POLICY "Users can view church members"
  ON church_members FOR SELECT
  USING (church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage church members"
  ON church_members FOR ALL
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users 
    WHERE id = auth.uid() AND role IN ('super_admin', 'lead_admin', 'admin_staff')
  ));

-- ============================================
-- Script 03: Seed Initial Data
-- ============================================

-- Insert sample church tenant (only if none exist)
INSERT INTO church_tenants (name)
SELECT 'Sample Church'
WHERE NOT EXISTS (SELECT 1 FROM church_tenants LIMIT 1);

-- ============================================
-- Script 04: Fix Signup RLS Policy
-- ============================================

DROP POLICY IF EXISTS "Allow user creation during signup" ON users;

CREATE POLICY "Allow user creation during signup"
  ON users FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Script 05: Create User Profile Trigger
-- ============================================

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ============================================
-- Script 06: Add Super Admin Manually
-- ============================================

-- This script is typically run manually with a specific user ID
-- Skipping automatic execution

-- ============================================
-- Script 07: Fix Super Admin and RLS
-- ============================================

DROP POLICY IF EXISTS "Super admins can view all church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can manage all church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;

CREATE POLICY "Super admins can view all church tenants"
  ON church_tenants FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can manage all church tenants"
  ON church_tenants FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can manage all users"
  ON users FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

-- ============================================
-- Script 08: Fix Super Admin RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Super admins can manage all events" ON events;
DROP POLICY IF EXISTS "Super admins can manage all visitors" ON visitors;
DROP POLICY IF EXISTS "Super admins can manage all teams" ON teams;
DROP POLICY IF EXISTS "Super admins can manage all team members" ON team_members;
DROP POLICY IF EXISTS "Super admins can manage all attendance" ON attendance;
DROP POLICY IF EXISTS "Super admins can manage all newsletters" ON newsletters;
DROP POLICY IF EXISTS "Super admins can manage all church members" ON church_members;

CREATE POLICY "Super admins can manage all events"
  ON events FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can manage all visitors"
  ON visitors FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can manage all teams"
  ON teams FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can manage all team members"
  ON team_members FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can manage all attendance"
  ON attendance FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can manage all newsletters"
  ON newsletters FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "Super admins can manage all church members"
  ON church_members FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = TRUE));

-- ============================================
-- BATCH 1 COMPLETE
-- ============================================
