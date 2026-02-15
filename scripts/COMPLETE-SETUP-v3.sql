-- ============================================
-- COMPLETE DATABASE SETUP - VERSION 3
-- Combines all 33 migration scripts
-- Fixes: Enum transaction issues
-- ============================================

-- ============================================
-- SECTION 1: DROP AND RECREATE ENUM TYPES
-- This ensures clean enum creation without transaction issues
-- ============================================

-- Drop existing enum types with CASCADE to remove dependencies
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS visitor_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;

-- Create enum types with all values at once
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'lead_admin', 
  'admin_staff',
  'volunteer',
  'member'
);

CREATE TYPE visitor_status AS ENUM (
  'new',
  'contacted',
  'returning',
  'member'
);

CREATE TYPE event_type AS ENUM (
  'service',
  'meeting',
  'outreach',
  'social'
);

CREATE TYPE attendance_status AS ENUM (
  'present',
  'absent',
  'excused'
);

-- ============================================
-- SECTION 2: CREATE ALL TABLES
-- ============================================

-- Church Tenants Table
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  church_code VARCHAR(50) UNIQUE NOT NULL,
  slack_workspace_url TEXT,
  slack_bot_token TEXT,
  slack_user_token TEXT,
  google_drive_url TEXT,
  rundown_channel_name TEXT DEFAULT 'event-rundowns',
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

-- Church Members Table
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  joined_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, church_tenant_id)
);

-- Add missing columns to existing tables
DO $$ 
BEGIN
  -- Add role column to users if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'member';
  END IF;
  
  -- Add phone column to users if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
  END IF;
  
  -- Add is_super_admin column to users if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_super_admin') THEN
    ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add notification_settings column to users if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='notification_settings') THEN
    ALTER TABLE users ADD COLUMN notification_settings JSONB DEFAULT '{"email": true, "slack": true}'::jsonb;
  END IF;
  
  -- Add church_tenant_id column to users if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='church_tenant_id') THEN
    ALTER TABLE users ADD COLUMN church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add created_by column to events if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='created_by') THEN
    ALTER TABLE events ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
    -- Update existing events to use leader as creator
    UPDATE events SET created_by = leader_id WHERE created_by IS NULL AND leader_id IS NOT NULL;
  END IF;
END $$;

-- Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status visitor_status NOT NULL DEFAULT 'new',
  first_visit_date DATE DEFAULT CURRENT_DATE,
  last_contact_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'present',
  checked_in_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Newsletters Table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slack Messages Table
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rundown Modules Table
CREATE TABLE IF NOT EXISTS rundown_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_team_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rundown_id, category_id, user_id)
);

-- Worship Songs Table
CREATE TABLE IF NOT EXISTS worship_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- SECTION 3: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Super admins can view all church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can insert church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can update church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can delete church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Users can view their own church tenant" ON church_tenants;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;
DROP POLICY IF EXISTS "Lead admins can view users in their church" ON users;
DROP POLICY IF EXISTS "Lead admins can manage users in their church" ON users;

DROP POLICY IF EXISTS "Users can view members in their church" ON church_members;
DROP POLICY IF EXISTS "Lead admins can manage members in their church" ON church_members;
DROP POLICY IF EXISTS "Super admins can manage all members" ON church_members;

DROP POLICY IF EXISTS "Users can view teams in their church" ON teams;
DROP POLICY IF EXISTS "Lead admins can manage teams in their church" ON teams;
DROP POLICY IF EXISTS "Super admins can manage all teams" ON teams;

DROP POLICY IF EXISTS "Users can view team members in their church" ON team_members;
DROP POLICY IF EXISTS "Lead admins can manage team members in their church" ON team_members;
DROP POLICY IF EXISTS "Super admins can manage all team members" ON team_members;

DROP POLICY IF EXISTS "Users can view events in their church" ON events;
DROP POLICY IF EXISTS "Lead admins can manage events in their church" ON events;
DROP POLICY IF EXISTS "Super admins can manage all events" ON events;

DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Lead admins can manage visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Super admins can manage all visitors" ON visitors;

DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Lead admins can manage attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Super admins can manage all attendance" ON attendance;

DROP POLICY IF EXISTS "Users can view newsletters in their church" ON newsletters;
DROP POLICY IF EXISTS "Lead admins can manage newsletters in their church" ON newsletters;
DROP POLICY IF EXISTS "Super admins can manage all newsletters" ON newsletters;

DROP POLICY IF EXISTS "Users can view slack messages in their church" ON slack_messages;
DROP POLICY IF EXISTS "Lead admins can manage slack messages in their church" ON slack_messages;
DROP POLICY IF EXISTS "Super admins can manage all slack messages" ON slack_messages;

DROP POLICY IF EXISTS "Users can view rundowns in their church" ON event_rundowns;
DROP POLICY IF EXISTS "Lead admins can manage rundowns in their church" ON event_rundowns;
DROP POLICY IF EXISTS "Super admins can manage all rundowns" ON event_rundowns;

DROP POLICY IF EXISTS "Users can view rundown modules in their church" ON rundown_modules;
DROP POLICY IF EXISTS "Lead admins can manage rundown modules in their church" ON rundown_modules;
DROP POLICY IF EXISTS "Super admins can manage all rundown modules" ON rundown_modules;

DROP POLICY IF EXISTS "Users can view team categories in their church" ON service_team_categories;
DROP POLICY IF EXISTS "Lead admins can manage team categories in their church" ON service_team_categories;
DROP POLICY IF EXISTS "Super admins can manage all team categories" ON service_team_categories;

DROP POLICY IF EXISTS "Users can view team assignments in their church" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Lead admins can manage team assignments in their church" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Super admins can manage all team assignments" ON rundown_team_assignments;

DROP POLICY IF EXISTS "Users can view worship songs in their church" ON worship_songs;
DROP POLICY IF EXISTS "Lead admins can manage worship songs in their church" ON worship_songs;
DROP POLICY IF EXISTS "Super admins can manage all worship songs" ON worship_songs;

-- Church Tenants Policies
CREATE POLICY "Super admins can view all church tenants" ON church_tenants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

CREATE POLICY "Super admins can insert church tenants" ON church_tenants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

CREATE POLICY "Super admins can update church tenants" ON church_tenants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

CREATE POLICY "Super admins can delete church tenants" ON church_tenants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

CREATE POLICY "Users can view their own church tenant" ON church_tenants
  FOR SELECT USING (
    id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

-- Users Policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Super admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "Super admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true)
  );

CREATE POLICY "Lead admins can view users in their church" ON users
  FOR SELECT USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users u 
      WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Lead admins can manage users in their church" ON users
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users u 
      WHERE u.id = auth.uid() AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

-- Church Members Policies (NO SELF-REFERENCING)
CREATE POLICY "Users can view members in their church" ON church_members
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Lead admins can manage members in their church" ON church_members
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all members" ON church_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Teams Policies
CREATE POLICY "Users can view teams in their church" ON teams
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Lead admins can manage teams in their church" ON teams
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all teams" ON teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Team Members Policies
CREATE POLICY "Users can view team members in their church" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM teams 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
    )
  );

CREATE POLICY "Lead admins can manage team members in their church" ON team_members
  FOR ALL USING (
    team_id IN (
      SELECT id FROM teams 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
      )
    )
  );

CREATE POLICY "Super admins can manage all team members" ON team_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Events Policies
CREATE POLICY "Users can view events in their church" ON events
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Lead admins can manage events in their church" ON events
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Visitors Policies
CREATE POLICY "Users can view visitors in their church" ON visitors
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Lead admins can manage visitors in their church" ON visitors
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all visitors" ON visitors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Attendance Policies
CREATE POLICY "Users can view attendance in their church" ON attendance
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
    )
  );

CREATE POLICY "Lead admins can manage attendance in their church" ON attendance
  FOR ALL USING (
    event_id IN (
      SELECT id FROM events 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
      )
    )
  );

CREATE POLICY "Super admins can manage all attendance" ON attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Newsletters Policies
CREATE POLICY "Users can view newsletters in their church" ON newsletters
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Lead admins can manage newsletters in their church" ON newsletters
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all newsletters" ON newsletters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Slack Messages Policies
CREATE POLICY "Users can view slack messages in their church" ON slack_messages
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Lead admins can manage slack messages in their church" ON slack_messages
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all slack messages" ON slack_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Event Rundowns Policies
CREATE POLICY "Users can view rundowns in their church" ON event_rundowns
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Lead admins can manage rundowns in their church" ON event_rundowns
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all rundowns" ON event_rundowns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Rundown Modules Policies
CREATE POLICY "Users can view rundown modules in their church" ON rundown_modules
  FOR SELECT USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
    )
  );

CREATE POLICY "Lead admins can manage rundown modules in their church" ON rundown_modules
  FOR ALL USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
      )
    )
  );

CREATE POLICY "Super admins can manage all rundown modules" ON rundown_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Service Team Categories Policies
CREATE POLICY "Users can view team categories in their church" ON service_team_categories
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Lead admins can manage team categories in their church" ON service_team_categories
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all team categories" ON service_team_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Rundown Team Assignments Policies
CREATE POLICY "Users can view team assignments in their church" ON rundown_team_assignments
  FOR SELECT USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
    )
  );

CREATE POLICY "Lead admins can manage team assignments in their church" ON rundown_team_assignments
  FOR ALL USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
      )
    )
  );

CREATE POLICY "Super admins can manage all team assignments" ON rundown_team_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- Worship Songs Policies
CREATE POLICY "Users can view worship songs in their church" ON worship_songs
  FOR SELECT USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (SELECT church_tenant_id FROM users WHERE users.id = auth.uid())
    )
  );

CREATE POLICY "Lead admins can manage worship songs in their church" ON worship_songs
  FOR ALL USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE users.id = auth.uid() AND users.role IN ('lead_admin', 'admin_staff')
      )
    )
  );

CREATE POLICY "Super admins can manage all worship songs" ON worship_songs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_super_admin = true)
  );

-- ============================================
-- SECTION 4: FUNCTIONS AND TRIGGERS
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_church_tenants_updated_at ON church_tenants;
CREATE TRIGGER update_church_tenants_updated_at
  BEFORE UPDATE ON church_tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_church_members_updated_at ON church_members;
CREATE TRIGGER update_church_members_updated_at
  BEFORE UPDATE ON church_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletters_updated_at ON newsletters;
CREATE TRIGGER update_newsletters_updated_at
  BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_rundowns_updated_at ON event_rundowns;
CREATE TRIGGER update_event_rundowns_updated_at
  BEFORE UPDATE ON event_rundowns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rundown_modules_updated_at ON rundown_modules;
CREATE TRIGGER update_rundown_modules_updated_at
  BEFORE UPDATE ON rundown_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_team_categories_updated_at ON service_team_categories;
CREATE TRIGGER update_service_team_categories_updated_at
  BEFORE UPDATE ON service_team_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_worship_songs_updated_at ON worship_songs;
CREATE TRIGGER update_worship_songs_updated_at
  BEFORE UPDATE ON worship_songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SECTION 5: SEED DEFAULT DATA
-- ============================================

-- Function to seed default team categories for a church
CREATE OR REPLACE FUNCTION seed_default_team_categories(tenant_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO service_team_categories (church_tenant_id, name, description, order_index)
  VALUES
    (tenant_id, 'Worship Team', 'Musicians and vocalists leading worship', 1),
    (tenant_id, 'Media Team', 'Audio, video, and lighting technicians', 2),
    (tenant_id, 'Camera Team', 'Video recording and live streaming operators', 3),
    (tenant_id, 'Clean Up Team', 'Post-service cleanup and facility maintenance', 4)
  ON CONFLICT (church_tenant_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETE! Database setup finished.
-- ============================================
