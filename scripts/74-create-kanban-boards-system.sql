-- Create system for custom kanban boards

-- Kanban boards table
CREATE TABLE IF NOT EXISTS kanban_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'layout-kanban',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kanban columns table
CREATE TABLE IF NOT EXISTS kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kanban cards table
CREATE TABLE IF NOT EXISTS kanban_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kanban_boards_tenant ON kanban_boards(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_board ON kanban_columns(board_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_assigned ON kanban_cards(assigned_to);

-- Enable RLS
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kanban_boards
CREATE POLICY "Users can view boards in their tenant"
  ON kanban_boards FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage boards"
  ON kanban_boards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND church_tenant_id = kanban_boards.church_tenant_id
      AND role IN ('super_admin', 'admin')
    )
  );

-- RLS Policies for kanban_columns
CREATE POLICY "Users can view columns in their tenant boards"
  ON kanban_columns FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM kanban_boards
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage columns"
  ON kanban_columns FOR ALL
  USING (
    board_id IN (
      SELECT kb.id FROM kanban_boards kb
      JOIN users u ON u.church_tenant_id = kb.church_tenant_id
      WHERE u.id = auth.uid() AND u.role IN ('super_admin', 'admin')
    )
  );

-- RLS Policies for kanban_cards
CREATE POLICY "Users can view cards in their tenant boards"
  ON kanban_cards FOR SELECT
  USING (
    column_id IN (
      SELECT kc.id FROM kanban_columns kc
      JOIN kanban_boards kb ON kb.id = kc.board_id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage cards"
  ON kanban_cards FOR ALL
  USING (
    column_id IN (
      SELECT kc.id FROM kanban_columns kc
      JOIN kanban_boards kb ON kb.id = kc.board_id
      JOIN users u ON u.church_tenant_id = kb.church_tenant_id
      WHERE u.id = auth.uid()
    )
  );

-- Updated migration to handle all possible visitor status enum values
-- Migrate existing visitors to default kanban board
DO $$
DECLARE
  tenant_record RECORD;
  board_id UUID;
  col_new UUID;
  col_follow_up UUID;
  col_engaged UUID;
BEGIN
  FOR tenant_record IN SELECT id FROM church_tenants LOOP
    -- Create default "Visitor Pipeline" board
    INSERT INTO kanban_boards (church_tenant_id, name, description, icon, position)
    VALUES (tenant_record.id, 'Visitor Pipeline', 'Track and manage church visitors', 'users', 0)
    RETURNING id INTO board_id;
    
    -- Create default columns
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (board_id, 'New Visitors', 'blue', 0)
    RETURNING id INTO col_new;
    
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (board_id, 'Needs Follow Up', 'amber', 1)
    RETURNING id INTO col_follow_up;
    
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (board_id, 'Engaged Visitors', 'emerald', 2)
    RETURNING id INTO col_engaged;
    
    -- Migrate existing visitors to kanban cards
    -- Handle all possible status values: new, contacted, follow_up, following_up, returning, engaged, connected, member, inactive
    INSERT INTO kanban_cards (column_id, title, description, assigned_to, position, metadata)
    SELECT 
      CASE 
        WHEN status IN ('new') THEN col_new
        WHEN status IN ('contacted', 'follow_up', 'following_up') THEN col_follow_up
        WHEN status IN ('returning', 'engaged', 'connected', 'member') THEN col_engaged
        ELSE col_new -- Default to new column for any other status
      END,
      full_name,
      COALESCE(notes, ''),
      assigned_to,
      ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at) - 1,
      jsonb_build_object(
        'email', email,
        'phone', phone,
        'first_visit_date', first_visit_date,
        'visitor_id', id
      )
    FROM visitors
    WHERE church_tenant_id = tenant_record.id;
  END LOOP;
END $$;
