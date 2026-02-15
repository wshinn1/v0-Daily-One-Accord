-- ============================================
-- PART 2: TABLES, POLICIES, AND DATA
-- Run this AFTER Part 1 completes successfully
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SECTION 1: CREATE ALL TABLES
-- ============================================

-- Church Tenants Table
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  church_code VARCHAR(50) UNIQUE NOT NULL,
  slack_workspace_url TEXT,
  slack_bot_token TEXT,
  slack_user_token TEXT,
  slack_team_id TEXT,
  rundown_channel_name TEXT DEFAULT 'event-rundowns',
  google_drive_url TEXT,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  joined_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status visitor_status DEFAULT 'new',
  first_visit_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
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
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
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
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Team Categories Table
CREATE TABLE IF NOT EXISTS service_team_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- ============================================
-- SECTION 2: ROW LEVEL SECURITY POLICIES
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
ALTER TABLE event_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can view all church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can insert church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can update church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can delete church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Users can view their own church tenant" ON church_tenants;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Users can view users in their church" ON users;

DROP POLICY IF EXISTS "Users can view members in their church" ON church_members;
DROP POLICY IF EXISTS "Admins can manage members in their church" ON church_members;
DROP POLICY IF EXISTS "Super admins can manage all members" ON church_members;

DROP POLICY IF EXISTS "Users can view events in their church" ON events;
DROP POLICY IF EXISTS "Admins can manage events in their church" ON events;
DROP POLICY IF EXISTS "Super admins can manage all events" ON events;

DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Admins can manage visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Super admins can manage all visitors" ON visitors;

DROP POLICY IF EXISTS "Users can view teams in their church" ON teams;
DROP POLICY IF EXISTS "Admins can manage teams in their church" ON teams;
DROP POLICY IF EXISTS "Super admins can manage all teams" ON teams;

DROP POLICY IF EXISTS "Users can view team members in their church" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members in their church" ON team_members;
DROP POLICY IF EXISTS "Super admins can manage all team members" ON team_members;

DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Admins can manage attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Super admins can manage all attendance" ON attendance;

DROP POLICY IF EXISTS "Users can view rundowns in their church" ON event_rundowns;
DROP POLICY IF EXISTS "Admins can manage rundowns in their church" ON event_rundowns;
DROP POLICY IF EXISTS "Super admins can manage all rundowns" ON event_rundowns;

DROP POLICY IF EXISTS "Users can view rundown modules" ON rundown_modules;
DROP POLICY IF EXISTS "Admins can manage rundown modules" ON rundown_modules;
DROP POLICY IF EXISTS "Super admins can manage all rundown modules" ON rundown_modules;

DROP POLICY IF EXISTS "Users can view team categories in their church" ON service_team_categories;
DROP POLICY IF EXISTS "Admins can manage team categories in their church" ON service_team_categories;
DROP POLICY IF EXISTS "Super admins can manage all team categories" ON service_team_categories;

DROP POLICY IF EXISTS "Users can view team assignments" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Admins can manage team assignments" ON rundown_team_assignments;
DROP POLICY IF EXISTS "Super admins can manage all team assignments" ON rundown_team_assignments;

DROP POLICY IF EXISTS "Users can view worship songs" ON worship_songs;
DROP POLICY IF EXISTS "Admins can manage worship songs" ON worship_songs;
DROP POLICY IF EXISTS "Super admins can manage all worship songs" ON worship_songs;

DROP POLICY IF EXISTS "Users can view slack messages in their church" ON slack_messages;
DROP POLICY IF EXISTS "Users can insert slack messages in their church" ON slack_messages;
DROP POLICY IF EXISTS "Super admins can manage all slack messages" ON slack_messages;

-- Church Tenants Policies
CREATE POLICY "Super admins can view all church tenants"
  ON church_tenants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can insert church tenants"
  ON church_tenants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update church tenants"
  ON church_tenants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can delete church tenants"
  ON church_tenants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

CREATE POLICY "Users can view their own church tenant"
  ON church_tenants FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

-- Users Policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

CREATE POLICY "Users can view users in their church"
  ON users FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

-- Church Members Policies
CREATE POLICY "Users can view members in their church"
  ON church_members FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members in their church"
  ON church_members FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all members"
  ON church_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Events Policies
CREATE POLICY "Users can view events in their church"
  ON events FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage events in their church"
  ON events FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all events"
  ON events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Visitors Policies
CREATE POLICY "Users can view visitors in their church"
  ON visitors FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage visitors in their church"
  ON visitors FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all visitors"
  ON visitors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Teams Policies
CREATE POLICY "Users can view teams in their church"
  ON teams FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage teams in their church"
  ON teams FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all teams"
  ON teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Team Members Policies
CREATE POLICY "Users can view team members in their church"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users u ON t.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage team members in their church"
  ON team_members FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users u ON t.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Attendance Policies
CREATE POLICY "Users can view attendance in their church"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN users u ON e.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage attendance in their church"
  ON attendance FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN users u ON e.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Event Rundowns Policies
CREATE POLICY "Users can view rundowns in their church"
  ON event_rundowns FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage rundowns in their church"
  ON event_rundowns FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all rundowns"
  ON event_rundowns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Rundown Modules Policies
CREATE POLICY "Users can view rundown modules"
  ON rundown_modules FOR SELECT
  TO authenticated
  USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      JOIN users u ON r.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage rundown modules"
  ON rundown_modules FOR ALL
  TO authenticated
  USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      JOIN users u ON r.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all rundown modules"
  ON rundown_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Service Team Categories Policies
CREATE POLICY "Users can view team categories in their church"
  ON service_team_categories FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage team categories in their church"
  ON service_team_categories FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all team categories"
  ON service_team_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Rundown Team Assignments Policies
CREATE POLICY "Users can view team assignments"
  ON rundown_team_assignments FOR SELECT
  TO authenticated
  USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      JOIN users u ON r.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage team assignments"
  ON rundown_team_assignments FOR ALL
  TO authenticated
  USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      JOIN users u ON r.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all team assignments"
  ON rundown_team_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Worship Songs Policies
CREATE POLICY "Users can view worship songs"
  ON worship_songs FOR SELECT
  TO authenticated
  USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      JOIN users u ON r.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage worship songs"
  ON worship_songs FOR ALL
  TO authenticated
  USING (
    rundown_id IN (
      SELECT r.id FROM event_rundowns r
      JOIN users u ON r.church_tenant_id = u.church_tenant_id
      WHERE u.id = auth.uid() 
      AND u.role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Super admins can manage all worship songs"
  ON worship_songs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- Slack Messages Policies
CREATE POLICY "Users can view slack messages in their church"
  ON slack_messages FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert slack messages in their church"
  ON slack_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    church_tenant_id IN (
      SELECT u.church_tenant_id FROM users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all slack messages"
  ON slack_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- ============================================
-- SECTION 3: FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
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

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
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

-- Function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Part 2 complete! Database setup finished successfully.';
END $$;
