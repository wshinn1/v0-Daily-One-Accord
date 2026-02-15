-- Create default visitor board for existing tenants
-- This script sets up the visitor board as the default kanban board

-- Insert default visitor board for each tenant that doesn't have one
INSERT INTO kanban_boards (id, church_tenant_id, name, description, board_type, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'Visitors',
  'Track and manage church visitors',
  'visitors',
  NOW(),
  NOW()
FROM church_tenants ct
WHERE NOT EXISTS (
  SELECT 1 FROM kanban_boards kb 
  WHERE kb.church_tenant_id = ct.id AND kb.board_type = 'visitors'
);

-- Create default columns for visitor boards
-- Using ON CONFLICT DO NOTHING to make script idempotent
INSERT INTO kanban_columns (id, board_id, name, color, position, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  kb.id,
  'New Visitors',
  'blue',
  0,
  NOW(),
  NOW()
FROM kanban_boards kb
WHERE kb.board_type = 'visitors'
ON CONFLICT (board_id, position) DO NOTHING;

INSERT INTO kanban_columns (id, board_id, name, color, position, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  kb.id,
  'Needs Follow Up',
  'amber',
  1,
  NOW(),
  NOW()
FROM kanban_boards kb
WHERE kb.board_type = 'visitors'
ON CONFLICT (board_id, position) DO NOTHING;

INSERT INTO kanban_columns (id, board_id, name, color, position, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  kb.id,
  'Engaged Visitors',
  'emerald',
  2,
  NOW(),
  NOW()
FROM kanban_boards kb
WHERE kb.board_type = 'visitors'
ON CONFLICT (board_id, position) DO NOTHING;

-- Enable RLS on kanban tables if not already enabled
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for kanban_boards
DROP POLICY IF EXISTS "Users can view boards in their tenant" ON kanban_boards;
CREATE POLICY "Users can view boards in their tenant" ON kanban_boards
  FOR SELECT USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Lead admins can manage boards" ON kanban_boards;
CREATE POLICY "Lead admins can manage boards" ON kanban_boards
  FOR ALL USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('lead_admin', 'admin')
    )
  );

-- Create RLS policies for kanban_columns
DROP POLICY IF EXISTS "Users can view columns in their tenant" ON kanban_columns;
CREATE POLICY "Users can view columns in their tenant" ON kanban_columns
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM kanban_boards WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Lead admins can manage columns" ON kanban_columns;
CREATE POLICY "Lead admins can manage columns" ON kanban_columns
  FOR ALL USING (
    board_id IN (
      SELECT id FROM kanban_boards WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users 
        WHERE id = auth.uid() AND role IN ('lead_admin', 'admin')
      )
    )
  );

-- Create RLS policies for kanban_cards
DROP POLICY IF EXISTS "Users can view cards in their tenant" ON kanban_cards;
CREATE POLICY "Users can view cards in their tenant" ON kanban_cards
  FOR SELECT USING (
    column_id IN (
      SELECT kc.id FROM kanban_columns kc
      JOIN kanban_boards kb ON kc.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage cards in their tenant" ON kanban_cards;
CREATE POLICY "Users can manage cards in their tenant" ON kanban_cards
  FOR ALL USING (
    column_id IN (
      SELECT kc.id FROM kanban_columns kc
      JOIN kanban_boards kb ON kc.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );
