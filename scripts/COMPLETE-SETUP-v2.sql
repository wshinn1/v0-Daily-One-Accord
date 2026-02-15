-- ============================================
-- COMPLETE DATABASE SETUP - VERSION 2
-- Combines all 33 migration scripts
-- Handles existing tables and columns safely
-- ============================================

-- ============================================
-- SECTION 1: ENUM TYPES
-- ============================================

-- Create user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'lead_admin', 'admin_staff', 'volunteer', 'member');
    END IF;
END $$;

-- Add missing enum values if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'lead_admin' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'lead_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_staff' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'admin_staff';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'volunteer' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'volunteer';
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Create visitor_status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visitor_status') THEN
        CREATE TYPE visitor_status AS ENUM ('new', 'contacted', 'following_up', 'connected', 'member');
    END IF;
END $$;

-- Create event_status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
    END IF;
END $$;

-- ============================================
-- SECTION 2: TABLES
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Church Tenants Table
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to church_tenants
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'church_tenants' AND column_name = 'church_code') THEN
        ALTER TABLE church_tenants ADD COLUMN church_code VARCHAR(20) UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'church_tenants' AND column_name = 'slack_workspace_url') THEN
        ALTER TABLE church_tenants ADD COLUMN slack_workspace_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'church_tenants' AND column_name = 'rundown_channel_name') THEN
        ALTER TABLE church_tenants ADD COLUMN rundown_channel_name VARCHAR(255) DEFAULT 'event-rundowns';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'church_tenants' AND column_name = 'google_drive_url') THEN
        ALTER TABLE church_tenants ADD COLUMN google_drive_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'church_tenants' AND column_name = 'slack_bot_token') THEN
        ALTER TABLE church_tenants ADD COLUMN slack_bot_token TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'church_tenants' AND column_name = 'slack_team_id') THEN
        ALTER TABLE church_tenants ADD COLUMN slack_team_id VARCHAR(255);
    END IF;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  notification_settings JSONB DEFAULT '{"email": true, "slack": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'member';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Church Members Table
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, church_tenant_id)
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  leader_id UUID REFERENCES users(id),
  status event_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add created_by column to events
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_by') THEN
        ALTER TABLE events ADD COLUMN created_by UUID REFERENCES users(id);
    END IF;
END $$;

-- Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status visitor_status DEFAULT 'new',
  notes TEXT,
  visited_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT TRUE,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slack Messages Table
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) NOT NULL,
  message_ts VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, message_ts)
);

-- Event Rundowns Table
CREATE TABLE IF NOT EXISTS event_rundowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rundown Modules Table
CREATE TABLE IF NOT EXISTS rundown_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  assigned_to UUID REFERENCES users(id),
  start_time TIME,
  duration_minutes INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Team Categories Table
CREATE TABLE IF NOT EXISTS service_team_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Rundown Team Assignments Table
CREATE TABLE IF NOT EXISTS rundown_team_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_team_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worship Songs Table
CREATE TABLE IF NOT EXISTS worship_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  key VARCHAR(10),
  tempo VARCHAR(50),
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 3: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_church_tenant ON users(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_church_members_user ON church_members(user_id);
CREATE INDEX IF NOT EXISTS idx_church_members_church_tenant ON church_members(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_church_tenant ON events(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_church_tenant ON visitors(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_teams_church_tenant ON teams(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_church_tenant ON attendance(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_church_tenant ON slack_messages(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_channel ON slack_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_event_rundowns_church_tenant ON event_rundowns(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_rundown_modules_rundown ON rundown_modules(rundown_id);
CREATE INDEX IF NOT EXISTS idx_service_team_categories_church_tenant ON service_team_categories(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_rundown_team_assignments_rundown ON rundown_team_assignments(rundown_id);
CREATE INDEX IF NOT EXISTS idx_rundown_team_assignments_category ON rundown_team_assignments(category_id);
CREATE INDEX IF NOT EXISTS idx_worship_songs_rundown ON worship_songs(rundown_id);

-- ============================================
-- SECTION 4: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Super admins can view all church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Users can view their own church tenant" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can manage all church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can view members in their church" ON church_members;
DROP POLICY IF EXISTS "Lead admins can manage church members" ON church_members;
DROP POLICY IF EXISTS "Super admins can manage all church members" ON church_members;
DROP POLICY IF EXISTS "Users can view events in their church" ON events;
DROP POLICY IF EXISTS "Lead admins can manage events" ON events;
DROP POLICY IF EXISTS "Super admins can manage all events" ON events;
DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Lead admins can manage visitors" ON visitors;
DROP POLICY IF EXISTS "Super admins can manage all visitors" ON visitors;
DROP POLICY IF EXISTS "Users can view teams in their church" ON teams;
DROP POLICY IF EXISTS "Lead admins can manage teams" ON teams;
DROP POLICY IF EXISTS "Super admins can manage all teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members in their church" ON team_members;
DROP POLICY IF EXISTS "Lead admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Super admins can manage all team members" ON team_members;
DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Lead admins can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Super admins can manage all attendance" ON attendance;
DROP POLICY IF EXISTS "Users can view slack messages in their church" ON slack_messages;
DROP POLICY IF EXISTS "Lead admins can manage slack messages" ON slack_messages;
DROP POLICY IF EXISTS "Super admins can manage all slack messages" ON slack_messages;
DROP POLICY IF EXISTS "Users can view rundowns in their church" ON event_rundowns;
DROP POLICY IF EXISTS "Lead admins can manage rundowns" ON event_rundowns;
DROP POLICY IF EXISTS "Super admins can manage all rundowns" ON event_rundowns;
DROP POLICY IF EXISTS "Users can view rundown modules in their church" ON rundown_modules;
DROP POLICY IF EXISTS "Lead admins can manage rundown modules" ON rundown_modules;
DROP POLICY IF EXISTS "Super admins can manage all rundown modules" ON rundown_modules;
DROP POLICY IF EXISTS "Users can view team categories in their church" ON service_team_categories;
DROP POLICY IF EXISTS "Lead admins can manage team categories" ON service_team_categories;
DROP POLICY IF EXISTS "Super admins can manage all team categories" ON service_team_categories;
DROP POLICY IF EXISTS "Users can view team assignments in their church rundowns" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Lead admins can manage team assignments" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Super admins can manage all team assignments" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Users can view worship songs in their church rundowns" ON worship_songs;
DROP POLICY IF EXISTS "Lead admins can manage worship songs" ON worship_songs;
DROP POLICY IF EXISTS "Super admins can manage all worship songs" ON worship_songs;

-- Church Tenants Policies
CREATE POLICY "Super admins can view all church tenants"
  ON church_tenants FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY "Users can view their own church tenant"
  ON church_tenants FOR SELECT
  USING (id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Super admins can manage all church tenants"
  ON church_tenants FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true));

-- Users Policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true));

CREATE POLICY "Super admins can manage all users"
  ON users FOR ALL
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true));

-- Church Members Policies (NO INFINITE RECURSION)
CREATE POLICY "Users can view members in their church"
  ON church_members FOR SELECT
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage church members"
  ON church_members FOR ALL
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Events Policies
CREATE POLICY "Users can view events in their church"
  ON events FOR SELECT
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage events"
  ON events FOR ALL
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Visitors Policies
CREATE POLICY "Users can view visitors in their church"
  ON visitors FOR SELECT
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage visitors"
  ON visitors FOR ALL
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Teams Policies
CREATE POLICY "Users can view teams in their church"
  ON teams FOR SELECT
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage teams"
  ON teams FOR ALL
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Team Members Policies
CREATE POLICY "Users can view team members in their church"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT t.id FROM teams t 
      JOIN users u ON t.church_tenant_id = u.church_tenant_id 
      WHERE u.id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage team members"
  ON team_members FOR ALL
  USING (
    team_id IN (
      SELECT t.id FROM teams t 
      JOIN users u ON t.church_tenant_id = u.church_tenant_id 
      WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Attendance Policies
CREATE POLICY "Users can view attendance in their church"
  ON attendance FOR SELECT
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage attendance"
  ON attendance FOR ALL
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Slack Messages Policies
CREATE POLICY "Users can view slack messages in their church"
  ON slack_messages FOR SELECT
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage slack messages"
  ON slack_messages FOR ALL
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Event Rundowns Policies
CREATE POLICY "Users can view rundowns in their church"
  ON event_rundowns FOR SELECT
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage rundowns"
  ON event_rundowns FOR ALL
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Rundown Modules Policies
CREATE POLICY "Users can view rundown modules in their church"
  ON rundown_modules FOR SELECT
  USING (
    rundown_id IN (
      SELECT er.id FROM event_rundowns er 
      JOIN users u ON er.church_tenant_id = u.church_tenant_id 
      WHERE u.id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage rundown modules"
  ON rundown_modules FOR ALL
  USING (
    rundown_id IN (
      SELECT er.id FROM event_rundowns er 
      JOIN users u ON er.church_tenant_id = u.church_tenant_id 
      WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Service Team Categories Policies
CREATE POLICY "Users can view team categories in their church"
  ON service_team_categories FOR SELECT
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage team categories"
  ON service_team_categories FOR ALL
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Rundown Team Assignments Policies
CREATE POLICY "Users can view team assignments in their church rundowns"
  ON rundown_team_assignments FOR SELECT
  USING (
    rundown_id IN (
      SELECT er.id FROM event_rundowns er 
      JOIN users u ON er.church_tenant_id = u.church_tenant_id 
      WHERE u.id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage team assignments"
  ON rundown_team_assignments FOR ALL
  USING (
    rundown_id IN (
      SELECT er.id FROM event_rundowns er 
      JOIN users u ON er.church_tenant_id = u.church_tenant_id 
      WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Worship Songs Policies
CREATE POLICY "Users can view worship songs in their church rundowns"
  ON worship_songs FOR SELECT
  USING (
    rundown_id IN (
      SELECT er.id FROM event_rundowns er 
      JOIN users u ON er.church_tenant_id = u.church_tenant_id 
      WHERE u.id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Lead admins can manage worship songs"
  ON worship_songs FOR ALL
  USING (
    rundown_id IN (
      SELECT er.id FROM event_rundowns er 
      JOIN users u ON er.church_tenant_id = u.church_tenant_id 
      WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- ============================================
-- SECTION 5: FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to seed default team categories for a church tenant
CREATE OR REPLACE FUNCTION seed_default_team_categories(tenant_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO service_team_categories (church_tenant_id, name, description, order_index)
  VALUES
    (tenant_id, 'Worship Team', 'Musicians and vocalists leading worship', 1),
    (tenant_id, 'Media Team', 'Audio, video, and presentation operators', 2),
    (tenant_id, 'Camera Team', 'Video camera operators and directors', 3),
    (tenant_id, 'Clean Up Team', 'Post-service cleanup and setup crew', 4)
  ON CONFLICT (church_tenant_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Seed default categories for existing church tenants
DO $$
DECLARE
  tenant RECORD;
BEGIN
  FOR tenant IN SELECT id FROM church_tenants LOOP
    PERFORM seed_default_team_categories(tenant.id);
  END LOOP;
END $$;

-- ============================================
-- SETUP COMPLETE
-- ============================================
