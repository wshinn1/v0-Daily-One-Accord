-- Create Kanban Boards System with proper enum handling
-- This script creates the infrastructure for custom kanban boards and migrates existing visitor data

-- Step 1: Ensure visitor_status enum has the correct values
DO $$ 
BEGIN
  -- Check if the enum type exists and has the right values
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'visitor_status'
  ) THEN
    CREATE TYPE visitor_status AS ENUM ('new', 'follow_up', 'engaged');
  ELSE
    -- Add missing enum values if they don't exist
    BEGIN
      ALTER TYPE visitor_status ADD VALUE IF NOT EXISTS 'follow_up';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER TYPE visitor_status ADD VALUE IF NOT EXISTS 'engaged';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Step 2: Fix any invalid status values in existing visitors table
UPDATE visitors 
SET status = 'new'
WHERE status NOT IN ('new', 'follow_up', 'engaged');

-- Step 3: Create kanban_boards table
CREATE TABLE IF NOT EXISTS kanban_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

-- Step 4: Create kanban_columns table
CREATE TABLE IF NOT EXISTS kanban_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) DEFAULT 'gray',
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create kanban_cards table
CREATE TABLE IF NOT EXISTS kanban_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_kanban_boards_church_tenant ON kanban_boards(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_board ON kanban_columns(board_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_assigned ON kanban_cards(assigned_to);

-- Step 7: Add RLS policies
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

-- Kanban boards policies
DROP POLICY IF EXISTS "Users can view kanban boards for their church" ON kanban_boards;
CREATE POLICY "Users can view kanban boards for their church" ON kanban_boards
  FOR SELECT USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage kanban boards" ON kanban_boards;
CREATE POLICY "Admins can manage kanban boards" ON kanban_boards
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'pastor')
    )
  );

-- Kanban columns policies
DROP POLICY IF EXISTS "Users can view kanban columns for their church" ON kanban_columns;
CREATE POLICY "Users can view kanban columns for their church" ON kanban_columns
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM kanban_boards 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage kanban columns" ON kanban_columns;
CREATE POLICY "Admins can manage kanban columns" ON kanban_columns
  FOR ALL USING (
    board_id IN (
      SELECT id FROM kanban_boards 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'admin', 'pastor')
      )
    )
  );

-- Kanban cards policies
DROP POLICY IF EXISTS "Users can view kanban cards for their church" ON kanban_cards;
CREATE POLICY "Users can view kanban cards for their church" ON kanban_cards
  FOR SELECT USING (
    column_id IN (
      SELECT c.id FROM kanban_columns c
      JOIN kanban_boards b ON c.board_id = b.id
      WHERE b.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage kanban cards" ON kanban_cards;
CREATE POLICY "Users can manage kanban cards" ON kanban_cards
  FOR ALL USING (
    column_id IN (
      SELECT c.id FROM kanban_columns c
      JOIN kanban_boards b ON c.board_id = b.id
      WHERE b.church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'admin', 'pastor', 'staff')
      )
    )
  );

-- Step 8: Migrate existing visitor data to kanban system
DO $$
DECLARE
  tenant_record RECORD;
  board_id UUID;
  col_new UUID;
  col_follow_up UUID;
  col_engaged UUID;
BEGIN
  -- For each church tenant, create a default visitor pipeline board
  FOR tenant_record IN SELECT id, name FROM church_tenants LOOP
    -- Create default visitor pipeline board
    INSERT INTO kanban_boards (church_tenant_id, name, description, is_default)
    VALUES (tenant_record.id, 'Visitor Pipeline', 'Track and manage church visitors', TRUE)
    RETURNING id INTO board_id;
    
    -- Create default columns
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (board_id, 'New Visitors', 'blue', 0)
    RETURNING id INTO col_new;
    
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (board_id, 'Follow Up', 'yellow', 1)
    RETURNING id INTO col_follow_up;
    
    INSERT INTO kanban_columns (board_id, name, color, position)
    VALUES (board_id, 'Engaged', 'green', 2)
    RETURNING id INTO col_engaged;
    
    -- Migrate existing visitors to kanban cards
    INSERT INTO kanban_cards (column_id, title, description, assigned_to, position, metadata)
    SELECT 
      CASE 
        WHEN status = 'new' THEN col_new
        WHEN status = 'follow_up' THEN col_follow_up
        WHEN status = 'engaged' THEN col_engaged
        ELSE col_new -- Default to new column
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
    
    RAISE NOTICE 'Created visitor pipeline board for church: %', tenant_record.name;
  END LOOP;
END $$;
