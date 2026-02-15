-- ============================================
-- COMPLETE DATABASE SETUP - MIGRATION SAFE
-- Handles existing tables and adds missing columns
-- ============================================

-- ============================================
-- SECTION 1: ENUM TYPES
-- ============================================

-- Create enum types with error handling
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'lead_admin', 'admin_staff', 'volunteer', 'member');
EXCEPTION
    WHEN duplicate_object THEN 
        -- Add missing enum values if type exists
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lead_admin';
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin_staff';
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'volunteer';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
END $$;

DO $$ BEGIN
    CREATE TYPE visitor_status AS ENUM ('new', 'contacted', 'following_up', 'connected', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- SECTION 2: CREATE TABLES
-- ============================================

-- Church Tenants Table
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  church_code VARCHAR(50) UNIQUE,
  slack_workspace_url TEXT,
  slack_bot_token TEXT,
  slack_user_token TEXT,
  google_drive_url TEXT,
  rundown_channel_name VARCHAR(255) DEFAULT 'event-rundowns',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  is_super_admin BOOLEAN DEFAULT FALSE,
  notification_settings JSONB DEFAULT '{"email": true, "slack": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to users table if it exists
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'member';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email": true, "slack": true}'::jsonb;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Church Members Table
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, church_tenant_id)
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add created_by column if missing
DO $$ BEGIN
    ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status visitor_status NOT NULL DEFAULT 'new',
  notes TEXT,
  first_visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Event Rundowns Table
CREATE TABLE IF NOT EXISTS event_rundowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rundown Modules Table
CREATE TABLE IF NOT EXISTS rundown_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id UUID NOT NULL REFERENCES event_rundowns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  start_time TIME,
  duration_minutes INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Team Categories Table
CREATE TABLE IF NOT EXISTS service_team_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Rundown Team Assignments Table
CREATE TABLE IF NOT EXISTS rundown_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id UUID NOT NULL REFERENCES event_rundowns(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_team_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worship Songs Table
CREATE TABLE IF NOT EXISTS worship_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id UUID NOT NULL REFERENCES event_rundowns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  key VARCHAR(10),
  tempo VARCHAR(50),
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slack Messages Table
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) NOT NULL,
  message_ts VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, message_ts)
);

-- ============================================
-- SECTION 3: DROP EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "super_admin_all_church_tenants" ON church_tenants;
DROP POLICY IF EXISTS "users_own_tenant" ON church_tenants;
DROP POLICY IF EXISTS "super_admin_all_users" ON users;
DROP POLICY IF EXISTS "users_own_profile" ON users;
DROP POLICY IF EXISTS "users_same_tenant" ON users;
DROP POLICY IF EXISTS "super_admin_all_church_members" ON church_members;
DROP POLICY IF EXISTS "users_own_church_members" ON church_members;
DROP POLICY IF EXISTS "super_admin_all_events" ON events;
DROP POLICY IF EXISTS "users_own_tenant_events" ON events;
DROP POLICY IF EXISTS "super_admin_all_visitors" ON visitors;
DROP POLICY IF EXISTS "users_own_tenant_visitors" ON visitors;
DROP POLICY IF EXISTS "super_admin_all_teams" ON teams;
DROP POLICY IF EXISTS "users_own_tenant_teams" ON teams;
DROP POLICY IF EXISTS "super_admin_all_team_members" ON team_members;
DROP POLICY IF EXISTS "users_own_tenant_team_members" ON team_members;
DROP POLICY IF EXISTS "super_admin_all_attendance" ON attendance;
DROP POLICY IF EXISTS "users_own_tenant_attendance" ON attendance;
DROP POLICY IF EXISTS "super_admin_all_rundowns" ON event_rundowns;
DROP POLICY IF EXISTS "users_own_tenant_rundowns" ON event_rundowns;
DROP POLICY IF EXISTS "super_admin_all_rundown_modules" ON rundown_modules;
DROP POLICY IF EXISTS "users_own_tenant_rundown_modules" ON rundown_modules;
DROP POLICY IF EXISTS "super_admin_all_team_categories" ON service_team_categories;
DROP POLICY IF EXISTS "users_own_tenant_team_categories" ON service_team_categories;
DROP POLICY IF EXISTS "super_admin_all_team_assignments" ON rundown_team_assignments;
DROP POLICY IF EXISTS "users_own_tenant_team_assignments" ON rundown_team_assignments;
DROP POLICY IF EXISTS "super_admin_all_worship_songs" ON worship_songs;
DROP POLICY IF EXISTS "users_own_tenant_worship_songs" ON worship_songs;
DROP POLICY IF EXISTS "super_admin_all_slack_messages" ON slack_messages;
DROP POLICY IF EXISTS "users_own_tenant_slack_messages" ON slack_messages;

-- ============================================
-- SECTION 4: ENABLE RLS
-- ============================================

ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 5: CREATE RLS POLICIES (NO RECURSION)
-- ============================================

-- Church Tenants Policies
CREATE POLICY "super_admin_all_church_tenants" ON church_tenants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant" ON church_tenants
  FOR SELECT USING (
    id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- Users Policies
CREATE POLICY "super_admin_all_users" ON users
  FOR ALL USING (is_super_admin = true OR id = auth.uid());

CREATE POLICY "users_own_profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_same_tenant" ON users
  FOR SELECT USING (
    church_tenant_id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- Church Members Policies (FIXED - NO RECURSION)
CREATE POLICY "super_admin_all_church_members" ON church_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_church_members" ON church_members
  FOR ALL USING (
    church_tenant_id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- Events Policies
CREATE POLICY "super_admin_all_events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_events" ON events
  FOR ALL USING (
    church_tenant_id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- Visitors Policies
CREATE POLICY "super_admin_all_visitors" ON visitors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_visitors" ON visitors
  FOR ALL USING (
    church_tenant_id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- Teams Policies
CREATE POLICY "super_admin_all_teams" ON teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_teams" ON teams
  FOR ALL USING (
    church_tenant_id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- Team Members Policies
CREATE POLICY "super_admin_all_team_members" ON team_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_team_members" ON team_members
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      INNER JOIN users u ON u.church_tenant_id = t.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

-- Attendance Policies
CREATE POLICY "super_admin_all_attendance" ON attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_attendance" ON attendance
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM events e
      INNER JOIN users u ON u.church_tenant_id = e.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

-- Event Rundowns Policies
CREATE POLICY "super_admin_all_rundowns" ON event_rundowns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_rundowns" ON event_rundowns
  FOR ALL USING (
    church_tenant_id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- Rundown Modules Policies
CREATE POLICY "super_admin_all_rundown_modules" ON rundown_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_rundown_modules" ON rundown_modules
  FOR ALL USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

-- Service Team Categories Policies
CREATE POLICY "super_admin_all_team_categories" ON service_team_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_team_categories" ON service_team_categories
  FOR ALL USING (
    church_tenant_id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- Rundown Team Assignments Policies
CREATE POLICY "super_admin_all_team_assignments" ON rundown_team_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_team_assignments" ON rundown_team_assignments
  FOR ALL USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

-- Worship Songs Policies
CREATE POLICY "super_admin_all_worship_songs" ON worship_songs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_worship_songs" ON worship_songs
  FOR ALL USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      INNER JOIN users u ON u.church_tenant_id = r.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

-- Slack Messages Policies
CREATE POLICY "super_admin_all_slack_messages" ON slack_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "users_own_tenant_slack_messages" ON slack_messages
  FOR ALL USING (
    church_tenant_id IN (SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid())
  );

-- ============================================
-- SECTION 6: SEED DEFAULT DATA
-- ============================================

-- Seed default service team categories for all church tenants
INSERT INTO service_team_categories (church_tenant_id, name, is_default)
SELECT ct.id, 'Worship Team', true
FROM church_tenants ct
WHERE NOT EXISTS (
  SELECT 1 FROM service_team_categories stc 
  WHERE stc.church_tenant_id = ct.id AND stc.name = 'Worship Team'
);

INSERT INTO service_team_categories (church_tenant_id, name, is_default)
SELECT ct.id, 'Media Team', true
FROM church_tenants ct
WHERE NOT EXISTS (
  SELECT 1 FROM service_team_categories stc 
  WHERE stc.church_tenant_id = ct.id AND stc.name = 'Media Team'
);

INSERT INTO service_team_categories (church_tenant_id, name, is_default)
SELECT ct.id, 'Camera Team', true
FROM church_tenants ct
WHERE NOT EXISTS (
  SELECT 1 FROM service_team_categories stc 
  WHERE stc.church_tenant_id = ct.id AND stc.name = 'Camera Team'
);

INSERT INTO service_team_categories (church_tenant_id, name, is_default)
SELECT ct.id, 'Clean Up Team', true
FROM church_tenants ct
WHERE NOT EXISTS (
  SELECT 1 FROM service_team_categories stc 
  WHERE stc.church_tenant_id = ct.id AND stc.name = 'Clean Up Team'
);

-- ============================================
-- COMPLETE!
-- ============================================
