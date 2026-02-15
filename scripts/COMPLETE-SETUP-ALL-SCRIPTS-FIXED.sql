-- ============================================================================
-- COMPLETE DATABASE SETUP - ALL 33 SCRIPTS COMBINED (FIXED)
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- SCRIPT 01: Setup Database Schema
-- ============================================================================

-- Drop existing types if they exist (to handle re-runs)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS visitor_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;

-- Create enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'lead_admin', 'admin_staff', 'volunteer', 'member');
CREATE TYPE visitor_status AS ENUM ('new', 'contacted', 'returning', 'member');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused');

-- Create church_tenants table
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  slack_bot_token TEXT,
  slack_team_id TEXT,
  slack_workspace_url TEXT,
  rundown_channel_name TEXT DEFAULT 'event-rundowns',
  google_drive_url TEXT,
  church_code TEXT UNIQUE,
  slack_access_token TEXT,
  slack_bot_user_id TEXT,
  slack_channel_id TEXT
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'member',
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  notification_settings JSONB DEFAULT '{"email": true, "slack": true}'::jsonb,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create church_members table
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, church_tenant_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
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
  first_visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_rundowns table
CREATE TABLE IF NOT EXISTS event_rundowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rundown_modules table
CREATE TABLE IF NOT EXISTS rundown_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIME,
  duration_minutes INTEGER,
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create slack_messages table
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  message_ts TEXT NOT NULL,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, message_ts)
);

-- Create service_team_categories table
CREATE TABLE IF NOT EXISTS service_team_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Create rundown_team_assignments table
CREATE TABLE IF NOT EXISTS rundown_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_team_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rundown_id, category_id, user_id)
);

-- Create worship_songs table
CREATE TABLE IF NOT EXISTS worship_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  key TEXT,
  tempo TEXT,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SCRIPT 02: Setup Row Level Security
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Super admins can view all ' || r.tablename || '" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Super admins can insert ' || r.tablename || '" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Super admins can update ' || r.tablename || '" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Super admins can delete ' || r.tablename || '" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Super admins can manage all ' || r.tablename || '" ON ' || r.tablename;
    END LOOP;
END $$;

-- Drop specific policies
DROP POLICY IF EXISTS "Users can view their own church tenant" ON church_tenants;
DROP POLICY IF EXISTS "Lead admins can update their church tenant" ON church_tenants;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in their church" ON users;
DROP POLICY IF EXISTS "Lead admins can update users in their church" ON users;
DROP POLICY IF EXISTS "Users can view members in their church" ON church_members;
DROP POLICY IF EXISTS "Lead admins can manage members in their church" ON church_members;
DROP POLICY IF EXISTS "Users can view events in their church" ON events;
DROP POLICY IF EXISTS "Lead admins can manage events in their church" ON events;
DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Lead admins can manage visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Users can view teams in their church" ON teams;
DROP POLICY IF EXISTS "Lead admins can manage teams in their church" ON teams;
DROP POLICY IF EXISTS "Users can view team members in their church" ON team_members;
DROP POLICY IF EXISTS "Lead admins can manage team members in their church" ON team_members;
DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Lead admins can manage attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Users can view newsletters in their church" ON newsletters;
DROP POLICY IF EXISTS "Lead admins can manage newsletters in their church" ON newsletters;
DROP POLICY IF EXISTS "Users can view rundowns in their church" ON event_rundowns;
DROP POLICY IF EXISTS "Lead admins can manage rundowns in their church" ON event_rundowns;
DROP POLICY IF EXISTS "Users can view rundown modules" ON rundown_modules;
DROP POLICY IF EXISTS "Lead admins can manage rundown modules" ON rundown_modules;
DROP POLICY IF EXISTS "Users can view slack messages in their church" ON slack_messages;
DROP POLICY IF EXISTS "Users can insert slack messages in their church" ON slack_messages;
DROP POLICY IF EXISTS "Users can view team categories in their church" ON service_team_categories;
DROP POLICY IF EXISTS "Lead admins can manage team categories" ON service_team_categories;
DROP POLICY IF EXISTS "Users can view team assignments" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Lead admins can manage team assignments" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Users can view worship songs" ON worship_songs;
DROP POLICY IF EXISTS "Lead admins can manage worship songs" ON worship_songs;

-- Church Tenants Policies
CREATE POLICY "Super admins can view all church tenants"
  ON church_tenants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can insert church tenants"
  ON church_tenants FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can update church tenants"
  ON church_tenants FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can delete church tenants"
  ON church_tenants FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Users can view their own church tenant"
  ON church_tenants FOR SELECT
  USING (id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can update their church tenant"
  ON church_tenants FOR UPDATE
  USING (id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

-- Users Policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can insert users"
  ON users FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can update all users"
  ON users FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can delete users"
  ON users FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Users can view users in their church"
  ON users FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can update users in their church"
  ON users FOR UPDATE
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

-- Church Members Policies
CREATE POLICY "Users can view members in their church"
  ON church_members FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage members in their church"
  ON church_members FOR ALL
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all members"
  ON church_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all members"
  ON church_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Events Policies
CREATE POLICY "Users can view events in their church"
  ON events FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage events in their church"
  ON events FOR ALL
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all events"
  ON events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all events"
  ON events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Visitors Policies
CREATE POLICY "Users can view visitors in their church"
  ON visitors FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage visitors in their church"
  ON visitors FOR ALL
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all visitors"
  ON visitors FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all visitors"
  ON visitors FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Teams Policies
CREATE POLICY "Users can view teams in their church"
  ON teams FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage teams in their church"
  ON teams FOR ALL
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all teams"
  ON teams FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all teams"
  ON teams FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Team Members Policies
CREATE POLICY "Users can view team members in their church"
  ON team_members FOR SELECT
  USING (team_id IN (
    SELECT t.id FROM teams t
    INNER JOIN users u ON u.church_tenant_id = t.church_tenant_id
    WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage team members in their church"
  ON team_members FOR ALL
  USING (team_id IN (
    SELECT t.id FROM teams t
    INNER JOIN users u ON u.church_tenant_id = t.church_tenant_id
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all team members"
  ON team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all team members"
  ON team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Attendance Policies
CREATE POLICY "Users can view attendance in their church"
  ON attendance FOR SELECT
  USING (event_id IN (
    SELECT e.id FROM events e
    INNER JOIN users u ON u.church_tenant_id = e.church_tenant_id
    WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage attendance in their church"
  ON attendance FOR ALL
  USING (event_id IN (
    SELECT e.id FROM events e
    INNER JOIN users u ON u.church_tenant_id = e.church_tenant_id
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all attendance"
  ON attendance FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all attendance"
  ON attendance FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Newsletters Policies
CREATE POLICY "Users can view newsletters in their church"
  ON newsletters FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage newsletters in their church"
  ON newsletters FOR ALL
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all newsletters"
  ON newsletters FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all newsletters"
  ON newsletters FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Event Rundowns Policies
CREATE POLICY "Users can view rundowns in their church"
  ON event_rundowns FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage rundowns in their church"
  ON event_rundowns FOR ALL
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all rundowns"
  ON event_rundowns FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all rundowns"
  ON event_rundowns FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Rundown Modules Policies
CREATE POLICY "Users can view rundown modules"
  ON rundown_modules FOR SELECT
  USING (rundown_id IN (
    SELECT r.id FROM event_rundowns r
    INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
    WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage rundown modules"
  ON rundown_modules FOR ALL
  USING (rundown_id IN (
    SELECT r.id FROM event_rundowns r
    INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all rundown modules"
  ON rundown_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all rundown modules"
  ON rundown_modules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Slack Messages Policies
CREATE POLICY "Users can view slack messages in their church"
  ON slack_messages FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Users can insert slack messages in their church"
  ON slack_messages FOR INSERT
  WITH CHECK (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Super admins can view all slack messages"
  ON slack_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all slack messages"
  ON slack_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Service Team Categories Policies
CREATE POLICY "Users can view team categories in their church"
  ON service_team_categories FOR SELECT
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage team categories"
  ON service_team_categories FOR ALL
  USING (church_tenant_id IN (
    SELECT u.church_tenant_id FROM users u
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all team categories"
  ON service_team_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all team categories"
  ON service_team_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Rundown Team Assignments Policies
CREATE POLICY "Users can view team assignments"
  ON rundown_team_assignments FOR SELECT
  USING (rundown_id IN (
    SELECT r.id FROM event_rundowns r
    INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
    WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage team assignments"
  ON rundown_team_assignments FOR ALL
  USING (rundown_id IN (
    SELECT r.id FROM event_rundowns r
    INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all team assignments"
  ON rundown_team_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all team assignments"
  ON rundown_team_assignments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- Worship Songs Policies
CREATE POLICY "Users can view worship songs"
  ON worship_songs FOR SELECT
  USING (rundown_id IN (
    SELECT r.id FROM event_rundowns r
    INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
    WHERE u.id = auth.uid()
  ));

CREATE POLICY "Lead admins can manage worship songs"
  ON worship_songs FOR ALL
  USING (rundown_id IN (
    SELECT r.id FROM event_rundowns r
    INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
    WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
  ));

CREATE POLICY "Super admins can view all worship songs"
  ON worship_songs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

CREATE POLICY "Super admins can manage all worship songs"
  ON worship_songs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
  ));

-- ============================================================================
-- SCRIPT 05: Create User Profile Trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Seed default team categories for all existing church tenants
-- ============================================================================

INSERT INTO service_team_categories (church_tenant_id, name, order_index)
SELECT id, 'Worship Team', 1 FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO service_team_categories (church_tenant_id, name, order_index)
SELECT id, 'Media Team', 2 FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO service_team_categories (church_tenant_id, name, order_index)
SELECT id, 'Camera Team', 3 FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

INSERT INTO service_team_categories (church_tenant_id, name, order_index)
SELECT id, 'Clean Up Team', 4 FROM church_tenants
ON CONFLICT (church_tenant_id, name) DO NOTHING;

-- ============================================================================
-- COMPLETE! All scripts have been executed successfully.
-- ============================================================================
