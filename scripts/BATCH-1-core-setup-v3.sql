-- ============================================
-- BATCH 1: Core Database Setup (Scripts 1-8)
-- ============================================
-- This batch sets up the core database schema, RLS policies, and user system
-- Safe version that handles existing types and adds missing enum values

-- ============================================
-- Script 01: Setup Database Schema
-- ============================================

-- First, let's handle the user_role enum type
-- Check if it exists and add missing values if needed
DO $$ 
BEGIN
    -- Create the enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'lead_admin', 'admin_staff', 'volunteer', 'member');
    ELSE
        -- Add missing enum values if they don't exist
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'lead_admin' AND enumtypid = 'user_role'::regtype) THEN
            ALTER TYPE user_role ADD VALUE 'lead_admin';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_staff' AND enumtypid = 'user_role'::regtype) THEN
            ALTER TYPE user_role ADD VALUE 'admin_staff';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'volunteer' AND enumtypid = 'user_role'::regtype) THEN
            ALTER TYPE user_role ADD VALUE 'volunteer';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'member' AND enumtypid = 'user_role'::regtype) THEN
            ALTER TYPE user_role ADD VALUE 'member';
        END IF;
    END IF;
END $$;

-- Handle visitor_status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visitor_status') THEN
        CREATE TYPE visitor_status AS ENUM ('new', 'contacted', 'returning', 'member');
    END IF;
END $$;

-- Handle attendance_status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused');
    END IF;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'member',
  is_super_admin BOOLEAN DEFAULT false,
  church_tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notification_settings JSONB DEFAULT '{"email": true, "slack": true}'::jsonb,
  phone TEXT
);

-- Create church_tenants table
CREATE TABLE IF NOT EXISTS church_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  slack_workspace_url TEXT,
  slack_bot_token TEXT,
  slack_user_token TEXT,
  slack_team_id TEXT,
  rundown_channel_name TEXT DEFAULT 'event-rundowns',
  google_drive_url TEXT,
  church_code TEXT UNIQUE,
  lead_admin_id UUID REFERENCES users(id)
);

-- Add foreign key constraint to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_church_tenant_id_fkey'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_church_tenant_id_fkey 
        FOREIGN KEY (church_tenant_id) REFERENCES church_tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create church_members table
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, church_tenant_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES users(id)
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
  first_visit_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status DEFAULT 'present',
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Create slack_messages table
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  message_ts TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, message_ts)
);

-- ============================================
-- Script 02: Setup Row Level Security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Users can view their church tenant" ON church_tenants;
DROP POLICY IF EXISTS "Super admins can manage all church tenants" ON church_tenants;
DROP POLICY IF EXISTS "Users can view members in their church" ON church_members;
DROP POLICY IF EXISTS "Users can view events in their church" ON events;
DROP POLICY IF EXISTS "Lead admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can view visitors in their church" ON visitors;
DROP POLICY IF EXISTS "Lead admins can manage visitors" ON visitors;
DROP POLICY IF EXISTS "Users can view teams in their church" ON teams;
DROP POLICY IF EXISTS "Lead admins can manage teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members in their church" ON team_members;
DROP POLICY IF EXISTS "Users can view attendance in their church" ON attendance;
DROP POLICY IF EXISTS "Lead admins can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Users can view newsletters in their church" ON newsletters;
DROP POLICY IF EXISTS "Lead admins can manage newsletters" ON newsletters;
DROP POLICY IF EXISTS "Users can view slack messages in their church" ON slack_messages;
DROP POLICY IF EXISTS "Lead admins can manage slack messages" ON slack_messages;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Church tenants policies
CREATE POLICY "Users can view their church tenant" ON church_tenants
  FOR SELECT USING (
    id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Super admins can manage all church tenants" ON church_tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Church members policies
CREATE POLICY "Users can view members in their church" ON church_members
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
  );

-- Events policies
CREATE POLICY "Users can view events in their church" ON events
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Lead admins can manage events" ON events
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
    )
  );

-- Visitors policies
CREATE POLICY "Users can view visitors in their church" ON visitors
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Lead admins can manage visitors" ON visitors
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
    )
  );

-- Teams policies
CREATE POLICY "Users can view teams in their church" ON teams
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Lead admins can manage teams" ON teams
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
    )
  );

-- Team members policies
CREATE POLICY "Users can view team members in their church" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM teams WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Attendance policies
CREATE POLICY "Users can view attendance in their church" ON attendance
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Lead admins can manage attendance" ON attendance
  FOR ALL USING (
    event_id IN (
      SELECT id FROM events WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
      )
    )
  );

-- Newsletters policies
CREATE POLICY "Users can view newsletters in their church" ON newsletters
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Lead admins can manage newsletters" ON newsletters
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
    )
  );

-- Slack messages policies
CREATE POLICY "Users can view slack messages in their church" ON slack_messages
  FOR SELECT USING (
    church_tenant_id IN (SELECT church_tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Lead admins can manage slack messages" ON slack_messages
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('lead_admin', 'admin_staff')
    )
  );

-- ============================================
-- Scripts 03-08: Additional setup
-- ============================================
-- These scripts contain fixes and triggers that will be applied in later batches
-- or are handled by the policies above

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
