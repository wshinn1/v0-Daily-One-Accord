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
