-- Event Rundowns Table
CREATE TABLE event_rundowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_type VARCHAR(100) DEFAULT 'church_service',
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  added_to_calendar BOOLEAN DEFAULT FALSE,
  calendar_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rundown Modules Table (individual sections/items in the rundown)
CREATE TABLE rundown_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rundown_id UUID REFERENCES event_rundowns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIME,
  duration_minutes INTEGER,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slack Channels for Rundowns
CREATE TABLE slack_rundown_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) NOT NULL,
  channel_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id)
);

-- Create indexes
CREATE INDEX idx_event_rundowns_church_tenant ON event_rundowns(church_tenant_id);
CREATE INDEX idx_event_rundowns_event_date ON event_rundowns(event_date);
CREATE INDEX idx_rundown_modules_rundown_id ON rundown_modules(rundown_id);
CREATE INDEX idx_rundown_modules_order ON rundown_modules(rundown_id, order_index);

-- Add RLS policies
ALTER TABLE event_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_rundown_channels ENABLE ROW LEVEL SECURITY;

-- Rundowns policies
CREATE POLICY "Users can view rundowns in their church"
  ON event_rundowns FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Lead admins and admin staff can create rundowns"
  ON event_rundowns FOR INSERT
  WITH CHECK (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Lead admins and admin staff can update rundowns"
  ON event_rundowns FOR UPDATE
  USING (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Lead admins and admin staff can delete rundowns"
  ON event_rundowns FOR DELETE
  USING (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Rundown modules policies
CREATE POLICY "Users can view modules in their church rundowns"
  ON rundown_modules FOR SELECT
  USING (
    rundown_id IN (
      SELECT id FROM event_rundowns 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Lead admins and admin staff can manage modules"
  ON rundown_modules FOR ALL
  USING (
    rundown_id IN (
      SELECT er.id FROM event_rundowns er
      JOIN church_members cm ON er.church_tenant_id = cm.church_tenant_id
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff', 'pastoral_team')
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Slack rundown channels policies
CREATE POLICY "Users can view slack rundown channels in their church"
  ON slack_rundown_channels FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Lead admins can manage slack rundown channels"
  ON slack_rundown_channels FOR ALL
  USING (
    church_tenant_id IN (
      SELECT cm.church_tenant_id 
      FROM church_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('lead_admin', 'admin_staff')
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true
    )
  );
