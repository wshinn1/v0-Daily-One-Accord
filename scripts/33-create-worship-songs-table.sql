-- Create worship songs table for rundowns
CREATE TABLE IF NOT EXISTS rundown_worship_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id UUID NOT NULL REFERENCES event_rundowns(id) ON DELETE CASCADE,
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  key TEXT,
  tempo TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rundown_worship_songs_rundown_id ON rundown_worship_songs(rundown_id);
CREATE INDEX IF NOT EXISTS idx_rundown_worship_songs_church_tenant_id ON rundown_worship_songs(church_tenant_id);

-- Enable RLS
ALTER TABLE rundown_worship_songs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view worship songs for their church tenant"
  ON rundown_worship_songs FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Lead admins and admin staff can insert worship songs"
  ON rundown_worship_songs FOR INSERT
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Lead admins and admin staff can update worship songs"
  ON rundown_worship_songs FOR UPDATE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin_staff')
    )
  );

CREATE POLICY "Lead admins and admin staff can delete worship songs"
  ON rundown_worship_songs FOR DELETE
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin_staff')
    )
  );
