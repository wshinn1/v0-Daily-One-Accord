-- ============================================================================
-- BATCH 1: CORE SETUP (Scripts 01-08)
-- Run this batch first to set up the database schema, RLS policies, and users
-- ============================================================================

-- ============================================================================
-- SCRIPT 01: Setup Database Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'pastor', 'elder', 'staff', 'volunteer', 'member');
CREATE TYPE visitor_status AS ENUM ('new', 'follow_up', 'engaged');

-- Church Tenants Table
CREATE TABLE church_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Roles Table (for tenant-specific custom roles)
CREATE TABLE custom_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Visitors Table
CREATE TABLE visitors (
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
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  allow_registration BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Registrations Table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  notes TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Ministry Teams Table
CREATE TABLE ministry_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ministry Team Members Table
CREATE TABLE ministry_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry_team_id UUID REFERENCES ministry_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ministry_team_id, user_id)
);

-- Volunteer Teams Table
CREATE TABLE volunteer_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  coordinator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer Team Members Table
CREATE TABLE volunteer_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_team_id UUID REFERENCES volunteer_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(volunteer_team_id, user_id)
);

-- Newsletters Table
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Recipients Table
CREATE TABLE newsletter_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE
);

-- Slack Integrations Table
CREATE TABLE slack_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  workspace_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  bot_user_id VARCHAR(255),
  team_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_church_tenant ON users(church_tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_visitors_church_tenant ON visitors(church_tenant_id);
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_events_church_tenant ON events(church_tenant_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_attendance_church_tenant ON attendance(church_tenant_id);
CREATE INDEX idx_ministry_teams_church_tenant ON ministry_teams(church_tenant_id);
CREATE INDEX idx_volunteer_teams_church_tenant ON volunteer_teams(church_tenant_id);

-- ============================================================================
-- SCRIPT 02: Setup Row Level Security
-- ============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE church_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
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

-- Helper function to get current user's church tenant
CREATE OR REPLACE FUNCTION get_user_church_tenant_id()
RETURNS UUID AS $$
  SELECT church_tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_super_admin FROM users WHERE id = auth.uid()), FALSE);
$$ LANGUAGE SQL SECURITY DEFINER;

-- Church Tenants Policies
CREATE POLICY "Super admins can view all tenants"
  ON church_tenants FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Users can view their own tenant"
  ON church_tenants FOR SELECT
  USING (id = get_user_church_tenant_id());

CREATE POLICY "Super admins can insert tenants"
  ON church_tenants FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update tenants"
  ON church_tenants FOR UPDATE
  USING (is_super_admin());

-- Users Policies
CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (
    is_super_admin() OR 
    church_tenant_id = get_user_church_tenant_id()
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can insert users in their tenant"
  ON users FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    (church_tenant_id = get_user_church_tenant_id() AND 
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );

-- Visitors Policies
CREATE POLICY "Users can view visitors in their tenant"
  ON visitors FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Staff can manage visitors in their tenant"
  ON visitors FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

-- Events Policies
CREATE POLICY "Users can view events in their tenant"
  ON events FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin() OR is_public = TRUE);

CREATE POLICY "Leaders can manage events in their tenant"
  ON events FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

-- Event Registrations Policies (public can register)
CREATE POLICY "Anyone can register for public events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_public = TRUE AND allow_registration = TRUE)
  );

CREATE POLICY "Staff can view registrations for their tenant events"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND (e.church_tenant_id = get_user_church_tenant_id() OR is_super_admin())
    )
  );

-- Attendance Policies
CREATE POLICY "Users can view attendance in their tenant"
  ON attendance FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Staff can manage attendance in their tenant"
  ON attendance FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

-- Ministry Teams Policies
CREATE POLICY "Users can view ministry teams in their tenant"
  ON ministry_teams FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Admins can manage ministry teams in their tenant"
  ON ministry_teams FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder'))
  );

-- Ministry Team Members Policies
CREATE POLICY "Users can view ministry team members in their tenant"
  ON ministry_team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ministry_teams mt
      WHERE mt.id = ministry_team_id 
      AND (mt.church_tenant_id = get_user_church_tenant_id() OR is_super_admin())
    )
  );

CREATE POLICY "Leaders can manage ministry team members"
  ON ministry_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ministry_teams mt
      JOIN users u ON u.id = auth.uid()
      WHERE mt.id = ministry_team_id 
      AND mt.church_tenant_id = u.church_tenant_id
      AND u.role IN ('admin', 'pastor', 'elder')
    )
  );

-- Similar policies for volunteer teams
CREATE POLICY "Users can view volunteer teams in their tenant"
  ON volunteer_teams FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Admins can manage volunteer teams in their tenant"
  ON volunteer_teams FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

CREATE POLICY "Users can view volunteer team members in their tenant"
  ON volunteer_team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_teams vt
      WHERE vt.id = volunteer_team_id 
      AND (vt.church_tenant_id = get_user_church_tenant_id() OR is_super_admin())
    )
  );

CREATE POLICY "Staff can manage volunteer team members"
  ON volunteer_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_teams vt
      JOIN users u ON u.id = auth.uid()
      WHERE vt.id = volunteer_team_id 
      AND vt.church_tenant_id = u.church_tenant_id
      AND u.role IN ('admin', 'pastor', 'elder', 'staff')
    )
  );

-- Newsletters Policies
CREATE POLICY "Staff can view newsletters in their tenant"
  ON newsletters FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Staff can manage newsletters in their tenant"
  ON newsletters FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff'))
  );

-- Slack Integrations Policies
CREATE POLICY "Admins can view slack integrations in their tenant"
  ON slack_integrations FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id() OR is_super_admin());

CREATE POLICY "Admins can manage slack integrations in their tenant"
  ON slack_integrations FOR ALL
  USING (
    church_tenant_id = get_user_church_tenant_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder'))
  );

-- ============================================================================
-- SCRIPT 03: Seed Initial Data
-- ============================================================================

-- Insert a demo church tenant for testing
INSERT INTO church_tenants (id, name, slug)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Church', 'demo-church');

-- ============================================================================
-- SCRIPT 04: Fix Signup RLS Policy
-- ============================================================================

-- Drop the existing restrictive INSERT policy on users table
DROP POLICY IF EXISTS "Admins can insert users in their tenant" ON users;

-- Create a new policy that allows users to insert their own profile during signup
CREATE POLICY "Users can create their own profile during signup"
  ON users FOR INSERT
  WITH CHECK (
    -- Allow if the user is creating their own profile (id matches auth.uid())
    id = auth.uid() OR
    -- OR if they're a super admin
    is_super_admin() OR 
    -- OR if they're an admin/pastor/elder in the same tenant
    (church_tenant_id = get_user_church_tenant_id() AND 
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );

-- ============================================================================
-- SCRIPT 05: Create User Profile Trigger (Version 1)
-- ============================================================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_tenant_id uuid;
BEGIN
  -- Get the first church tenant (or create a default one if none exists)
  SELECT id INTO default_tenant_id FROM public.church_tenants LIMIT 1;
  
  -- If no tenant exists, create a default one
  IF default_tenant_id IS NULL THEN
    INSERT INTO public.church_tenants (name, slug)
    VALUES ('Default Church', 'default-church')
    RETURNING id INTO default_tenant_id;
  END IF;

  -- Check if user email is the super admin email
  IF NEW.email = 'weshinn@gmail.com' THEN
    -- Create super admin user
    INSERT INTO public.users (
      id,
      email,
      full_name,
      church_tenant_id,
      role,
      is_super_admin,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Super Admin'),
      default_tenant_id,
      'admin',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Create regular user
    INSERT INTO public.users (
      id,
      email,
      full_name,
      church_tenant_id,
      role,
      is_super_admin,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      default_tenant_id,
      'member',
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to run after user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SCRIPT 06: Add Super Admin Manually
-- ============================================================================

-- Manually add super admin user for weshinn@gmail.com
-- This script finds your auth user ID and creates the corresponding user record

-- Insert the user record for the existing auth user
INSERT INTO public.users (id, email, full_name, role, church_tenant_id, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Wesley Shinn') as full_name,
  'super_admin' as role,
  NULL as church_tenant_id,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email = 'weshinn@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SCRIPT 07: Fix Super Admin and RLS
-- ============================================================================

-- Fix the is_super_admin field for weshinn@gmail.com
UPDATE users 
SET is_super_admin = true 
WHERE email = 'weshinn@gmail.com';

-- Drop the old users SELECT policy
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;

-- Create a new policy that allows users to read their own record
CREATE POLICY "Users can view their own record and users in their tenant"
  ON users FOR SELECT
  USING (
    id = auth.uid() OR  -- Users can always read their own record
    is_super_admin() OR 
    church_tenant_id = get_user_church_tenant_id()
  );

-- ============================================================================
-- SCRIPT 08: Fix Super Admin RLS Policies
-- ============================================================================

-- Fix RLS policies to allow super admins to manage all tenant data

-- Drop and recreate visitors policies to include super admin access
DROP POLICY IF EXISTS "Staff can manage visitors in their tenant" ON visitors;

CREATE POLICY "Staff and super admins can manage visitors"
  ON visitors FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix events policies
DROP POLICY IF EXISTS "Leaders can manage events in their tenant" ON events;

CREATE POLICY "Leaders and super admins can manage events"
  ON events FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix attendance policies
DROP POLICY IF EXISTS "Staff can manage attendance in their tenant" ON attendance;

CREATE POLICY "Staff and super admins can manage attendance"
  ON attendance FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix ministry teams policies
DROP POLICY IF EXISTS "Admins can manage ministry teams in their tenant" ON ministry_teams;

CREATE POLICY "Admins and super admins can manage ministry teams"
  ON ministry_teams FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );

-- Fix ministry team members policies
DROP POLICY IF EXISTS "Leaders can manage ministry team members" ON ministry_team_members;

CREATE POLICY "Leaders and super admins can manage ministry team members"
  ON ministry_team_members FOR ALL
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM ministry_teams mt
      JOIN users u ON u.id = auth.uid()
      WHERE mt.id = ministry_team_id 
      AND mt.church_tenant_id = u.church_tenant_id
      AND u.role IN ('admin', 'pastor', 'elder')
    )
  );

-- Fix volunteer teams policies
DROP POLICY IF EXISTS "Admins can manage volunteer teams in their tenant" ON volunteer_teams;

CREATE POLICY "Admins and super admins can manage volunteer teams"
  ON volunteer_teams FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix volunteer team members policies
DROP POLICY IF EXISTS "Staff can manage volunteer team members" ON volunteer_team_members;

CREATE POLICY "Staff and super admins can manage volunteer team members"
  ON volunteer_team_members FOR ALL
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM volunteer_teams vt
      JOIN users u ON u.id = auth.uid()
      WHERE vt.id = volunteer_team_id 
      AND vt.church_tenant_id = u.church_tenant_id
      AND u.role IN ('admin', 'pastor', 'elder', 'staff')
    )
  );

-- Fix newsletters policies
DROP POLICY IF EXISTS "Staff can manage newsletters in their tenant" ON newsletters;

CREATE POLICY "Staff and super admins can manage newsletters"
  ON newsletters FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder', 'staff')))
  );

-- Fix slack integrations policies
DROP POLICY IF EXISTS "Admins can manage slack integrations in their tenant" ON slack_integrations;

CREATE POLICY "Admins and super admins can manage slack integrations"
  ON slack_integrations FOR ALL
  USING (
    is_super_admin() OR
    (church_tenant_id = get_user_church_tenant_id() AND
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'elder')))
  );
