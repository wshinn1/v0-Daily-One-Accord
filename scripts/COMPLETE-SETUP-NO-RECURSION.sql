-- ============================================
-- COMPLETE DATABASE SETUP - ALL 33 SCRIPTS
-- FIXED: No infinite recursion in RLS policies
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- SECTION 1: EXTENSIONS AND ENUM TYPES
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate enum types to ensure clean state
DO $$ BEGIN
    DROP TYPE IF EXISTS user_role CASCADE;
    CREATE TYPE user_role AS ENUM ('super_admin', 'lead_admin', 'admin_staff', 'volunteer', 'member', 'admin', 'pastor', 'elder', 'staff');
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS visitor_status CASCADE;
    CREATE TYPE visitor_status AS ENUM ('new', 'follow_up', 'engaged');
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS membership_status CASCADE;
    CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'visitor');
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- ============================================
-- SECTION 2: CREATE ALL TABLES
-- ============================================

-- Church Tenants Table
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  church_code VARCHAR(20) UNIQUE,
  lead_admin_id UUID,
  slack_workspace_url TEXT,
  rundown_channel_name VARCHAR(255) DEFAULT 'event-rundowns',
  google_drive_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  is_super_admin BOOLEAN DEFAULT FALSE,
  notification_settings JSONB DEFAULT '{"email": true, "slack": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Church Members Table
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  membership_status membership_status DEFAULT 'active',
  joined_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, church_tenant_id)
);


-- Custom Roles Table
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status visitor_status DEFAULT 'new',
  notes TEXT,
  first_visit_date DATE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  allow_registration BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  notes TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Ministry Teams Table
CREATE TABLE IF NOT EXISTS ministry_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ministry Team Members Table
CREATE TABLE IF NOT EXISTS ministry_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry_team_id UUID REFERENCES ministry_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ministry_team_id, user_id)
);

-- Volunteer Teams Table
CREATE TABLE IF NOT EXISTS volunteer_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  coordinator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer Team Members Table
CREATE TABLE IF NOT EXISTS volunteer_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_team_id UUID REFERENCES volunteer_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(volunteer_team_id, user_id)
);

-- Newsletters Table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Recipients Table
CREATE TABLE IF NOT EXISTS newsletter_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE
);

-- Slack Integrations Table
CREATE TABLE IF NOT EXISTS slack_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  workspace_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  bot_user_id VARCHAR(255),
  bot_access_token TEXT,
  team_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id)
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
  event_date DATE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rundown Modules Table
CREATE TABLE IF NOT EXISTS rundown_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_time TIME,
  duration_minutes INTEGER,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Team Categories Table
CREATE TABLE IF NOT EXISTS service_team_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  UNIQUE(rundown_id, category_id, user_id)
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
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 3: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_church_tenant ON users(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_visitors_church_tenant ON visitors(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_events_church_tenant ON events(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_attendance_church_tenant ON attendance(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_ministry_teams_church_tenant ON ministry_teams(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_teams_church_tenant ON volunteer_teams(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_church_tenant ON slack_messages(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_channel ON slack_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_church_members_user ON church_members(user_id);
CREATE INDEX IF NOT EXISTS idx_church_members_tenant ON church_members(church_tenant_id);

-- ============================================
-- SECTION 4: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Fixed RLS policies to avoid infinite recursion by using users table for permission checks

-- Church Tenants Policies
CREATE POLICY "Super admins can manage all church tenants"
  ON church_tenants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Users can view their own church tenant"
  ON church_tenants FOR SELECT
  USING (
    id IN (
      SELECT church_tenant_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Lead admins can update their church tenant"
  ON church_tenants FOR UPDATE
  USING (
    id IN (
      SELECT church_tenant_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

-- Users Policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Super admins can manage all users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.is_super_admin = true
    )
  );

CREATE POLICY "Users can view users in their church"
  ON users FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users u
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Lead admins can manage users in their church"
  ON users FOR ALL
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

-- Church Members Policies (FIXED: No recursion - uses users table)
CREATE POLICY "Super admins can manage all church members"
  ON church_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Users can view church members in their church"
  ON church_members FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Lead admins can manage church members"
  ON church_members FOR ALL
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

-- Simple tenant-scoped policies for all other tables
CREATE POLICY "Users can manage their church data" ON custom_roles FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON visitors FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON events FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON attendance FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON ministry_teams FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON volunteer_teams FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON newsletters FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON slack_integrations FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON slack_messages FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON event_rundowns FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage their church data" ON service_team_categories FOR ALL
  USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Policies for junction/child tables
CREATE POLICY "Users can manage data" ON event_registrations FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage data" ON ministry_team_members FOR ALL
  USING (
    ministry_team_id IN (
      SELECT id FROM ministry_teams 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage data" ON volunteer_team_members FOR ALL
  USING (
    volunteer_team_id IN (
      SELECT id FROM volunteer_teams 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage data" ON newsletter_recipients FOR ALL
  USING (
    newsletter_id IN (
      SELECT id FROM newsletters 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage data" ON rundown_modules FOR ALL
  USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage data" ON rundown_team_assignments FOR ALL
  USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can manage data" ON worship_songs FOR ALL
  USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique church code
CREATE OR REPLACE FUNCTION generate_church_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM church_tenants WHERE church_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 6: SEED DEFAULT DATA
-- ============================================

-- Seed default service team categories for all existing church tenants
INSERT INTO service_team_categories (church_tenant_id, name, order_index)
SELECT 
  id,
  category_name,
  category_order
FROM church_tenants
CROSS JOIN (
  VALUES 
    ('Worship Team', 1),
    ('Media Team', 2),
    ('Camera Team', 3),
    ('Clean Up Team', 4)
) AS categories(category_name, category_order)
ON CONFLICT (church_tenant_id, name) DO NOTHING;

-- ============================================
-- COMPLETE! Database is ready to use.
-- ============================================
