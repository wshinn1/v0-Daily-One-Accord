-- Create time tracking system for visitor follow-ups
-- This allows team members to log time spent on visitor interactions

-- Time entries table
CREATE TABLE IF NOT EXISTS visitor_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  
  -- Time tracking
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- Calculated duration in minutes
  
  -- Entry details
  description TEXT,
  activity_type VARCHAR(50), -- 'phone_call', 'meeting', 'email', 'visit', 'other'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_visitor ON visitor_time_entries(visitor_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON visitor_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_tenant ON visitor_time_entries(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_started ON visitor_time_entries(started_at);

-- RLS Policies
ALTER TABLE visitor_time_entries ENABLE ROW LEVEL SECURITY;

-- Users can view time entries for their tenant
CREATE POLICY "Users can view time entries for their tenant"
  ON visitor_time_entries FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can create their own time entries
CREATE POLICY "Users can create their own time entries"
  ON visitor_time_entries FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can update their own time entries
CREATE POLICY "Users can update their own time entries"
  ON visitor_time_entries FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own time entries
CREATE POLICY "Users can delete their own time entries"
  ON visitor_time_entries FOR DELETE
  USING (user_id = auth.uid());
