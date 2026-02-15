-- Part 2: Create kanban system and migrate data
-- Run this AFTER running 74a

-- Create kanban tables
CREATE TABLE IF NOT EXISTS kanban_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  board_type TEXT NOT NULL DEFAULT 'custom', -- 'visitors', 'custom'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

CREATE TABLE IF NOT EXISTS kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, position)
);

CREATE TABLE IF NOT EXISTS kanban_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
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

-- RLS Policies
CREATE POLICY "Users can view kanban boards in their church"
  ON kanban_boards FOR SELECT
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage kanban boards in their church"
  ON kanban_boards FOR ALL
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view kanban columns in their church"
  ON kanban_columns FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM kanban_boards WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage kanban columns in their church"
  ON kanban_columns FOR ALL
  USING (
    board_id IN (
      SELECT id FROM kanban_boards WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view kanban cards in their church"
  ON kanban_cards FOR SELECT
  USING (
    column_id IN (
      SELECT id FROM kanban_columns WHERE board_id IN (
        SELECT id FROM kanban_boards WHERE church_tenant_id IN (
          SELECT church_tenant_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage kanban cards in their church"
  ON kanban_cards FOR ALL
  USING (
    column_id IN (
      SELECT id FROM kanban_columns WHERE board_id IN (
        SELECT id FROM kanban_boards WHERE church_tenant_id IN (
          SELECT church_tenant_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

-- Migrate existing visitors to kanban system
DO $$
DECLARE
  tenant_record RECORD;
  -- Renamed variables to avoid ambiguity with column names
  v_board_id UUID;
  v_col_new UUID;
  v_col_follow_up UUID;
  v_col_engaged UUID;
BEGIN
  -- For each church tenant that has visitors
  FOR tenant_record IN 
    SELECT DISTINCT church_tenant_id 
    FROM visitors 
    WHERE church_tenant_id IS NOT NULL
  LOOP
    -- Create visitor pipeline board
    INSERT INTO kanban_boards (church_tenant_id, name, description, board_type)
    VALUES (
      tenant_record.church_tenant_id,
      'Visitor Pipeline',
      'Track and manage church visitors through their journey',
      'visitors'
    )
    ON CONFLICT (church_tenant_id, name) DO NOTHING
    RETURNING id INTO v_board_id;

    -- If board already exists, get its ID
    IF v_board_id IS NULL THEN
      SELECT id INTO v_board_id 
      FROM kanban_boards 
      WHERE church_tenant_id = tenant_record.church_tenant_id 
        AND name = 'Visitor Pipeline';
    END IF;

    -- Insert columns separately to capture each ID individually
    -- Create "New Visitors" column
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (v_board_id, 'New Visitors', '#3B82F6', 0)
    ON CONFLICT (board_id, position) DO NOTHING
    RETURNING id INTO v_col_new;
    
    -- If column already exists, get its ID
    IF v_col_new IS NULL THEN
      SELECT id INTO v_col_new FROM kanban_columns WHERE board_id = v_board_id AND position = 0;
    END IF;

    -- Create "Follow Up" column
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (v_board_id, 'Follow Up', '#F59E0B', 1)
    ON CONFLICT (board_id, position) DO NOTHING
    RETURNING id INTO v_col_follow_up;
    
    -- If column already exists, get its ID
    IF v_col_follow_up IS NULL THEN
      SELECT id INTO v_col_follow_up FROM kanban_columns WHERE board_id = v_board_id AND position = 1;
    END IF;

    -- Create "Engaged" column
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (v_board_id, 'Engaged', '#10B981', 2)
    ON CONFLICT (board_id, position) DO NOTHING
    RETURNING id INTO v_col_engaged;
    
    -- If column already exists, get its ID
    IF v_col_engaged IS NULL THEN
      SELECT id INTO v_col_engaged FROM kanban_columns WHERE board_id = v_board_id AND position = 2;
    END IF;

    -- Migrate visitors to kanban cards
    INSERT INTO kanban_cards (column_id, title, description, assigned_to, position, metadata)
    SELECT 
      CASE 
        WHEN status::text = 'new' THEN v_col_new
        WHEN status::text IN ('contacted', 'follow_up', 'following_up') THEN v_col_follow_up
        WHEN status::text IN ('returning', 'engaged', 'connected', 'member') THEN v_col_engaged
        ELSE v_col_new
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
    WHERE church_tenant_id = tenant_record.church_tenant_id
    ON CONFLICT DO NOTHING;

  END LOOP;
END $$;
