-- Add advanced features to Unity kanban boards
-- Features: Comments, Activity Log, Due Dates, Priority, Labels, Attachments, Custom Fields

-- Add new columns to kanban_cards for advanced features
ALTER TABLE kanban_cards 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Create comments table
CREATE TABLE IF NOT EXISTS kanban_card_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}', -- Array of user IDs mentioned in comment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity log table
CREATE TABLE IF NOT EXISTS kanban_card_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'created', 'moved', 'assigned', 'commented', 'updated', 'archived'
  activity_data JSONB DEFAULT '{}', -- Store details like old/new column, old/new assignee, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS kanban_card_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create custom fields table (for board-level custom fields)
CREATE TABLE IF NOT EXISTS kanban_board_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'url', 'email', 'phone')),
  field_options JSONB DEFAULT '{}', -- For select/multiselect options
  is_required BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, field_name)
);

-- Create custom field values table
CREATE TABLE IF NOT EXISTS kanban_card_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  custom_field_id UUID NOT NULL REFERENCES kanban_board_custom_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(card_id, custom_field_id)
);

-- Create Slack notification settings table
CREATE TABLE IF NOT EXISTS kanban_board_slack_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  notify_on_card_created BOOLEAN DEFAULT TRUE,
  notify_on_card_moved BOOLEAN DEFAULT TRUE,
  notify_on_card_assigned BOOLEAN DEFAULT TRUE,
  notify_on_comment_added BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kanban_card_comments_card ON kanban_card_comments(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_comments_user ON kanban_card_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_activities_card ON kanban_card_activities(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_activities_user ON kanban_card_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_attachments_card ON kanban_card_attachments(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_board_custom_fields_board ON kanban_board_custom_fields(board_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_custom_field_values_card ON kanban_card_custom_field_values(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_custom_field_values_field ON kanban_card_custom_field_values(custom_field_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_due_date ON kanban_cards(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kanban_cards_priority ON kanban_cards(priority);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_archived ON kanban_cards(is_archived);

-- Enable RLS
ALTER TABLE kanban_card_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_card_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_card_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_board_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_card_custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_board_slack_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Comments
CREATE POLICY "Users can view comments in their church boards"
  ON kanban_card_comments FOR SELECT
  USING (
    card_id IN (
      SELECT kc.id FROM kanban_cards kc
      JOIN kanban_columns kcol ON kc.column_id = kcol.id
      JOIN kanban_boards kb ON kcol.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments in their church boards"
  ON kanban_card_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    card_id IN (
      SELECT kc.id FROM kanban_cards kc
      JOIN kanban_columns kcol ON kc.column_id = kcol.id
      JOIN kanban_boards kb ON kcol.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON kanban_card_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON kanban_card_comments FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for Activities
CREATE POLICY "Users can view activities in their church boards"
  ON kanban_card_activities FOR SELECT
  USING (
    card_id IN (
      SELECT kc.id FROM kanban_cards kc
      JOIN kanban_columns kcol ON kc.column_id = kcol.id
      JOIN kanban_boards kb ON kcol.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can create activities"
  ON kanban_card_activities FOR INSERT
  WITH CHECK (true);

-- RLS Policies for Attachments
CREATE POLICY "Users can view attachments in their church boards"
  ON kanban_card_attachments FOR SELECT
  USING (
    card_id IN (
      SELECT kc.id FROM kanban_cards kc
      JOIN kanban_columns kcol ON kc.column_id = kcol.id
      JOIN kanban_boards kb ON kcol.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage attachments in their church boards"
  ON kanban_card_attachments FOR ALL
  USING (
    card_id IN (
      SELECT kc.id FROM kanban_cards kc
      JOIN kanban_columns kcol ON kc.column_id = kcol.id
      JOIN kanban_boards kb ON kcol.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for Custom Fields
CREATE POLICY "Users can view custom fields in their church boards"
  ON kanban_board_custom_fields FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM kanban_boards WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage custom fields in their church boards"
  ON kanban_board_custom_fields FOR ALL
  USING (
    board_id IN (
      SELECT id FROM kanban_boards WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for Custom Field Values
CREATE POLICY "Users can view custom field values in their church boards"
  ON kanban_card_custom_field_values FOR SELECT
  USING (
    card_id IN (
      SELECT kc.id FROM kanban_cards kc
      JOIN kanban_columns kcol ON kc.column_id = kcol.id
      JOIN kanban_boards kb ON kcol.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage custom field values in their church boards"
  ON kanban_card_custom_field_values FOR ALL
  USING (
    card_id IN (
      SELECT kc.id FROM kanban_cards kc
      JOIN kanban_columns kcol ON kc.column_id = kcol.id
      JOIN kanban_boards kb ON kcol.board_id = kb.id
      WHERE kb.church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for Slack Settings
CREATE POLICY "Users can view Slack settings in their church boards"
  ON kanban_board_slack_settings FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM kanban_boards WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage Slack settings in their church boards"
  ON kanban_board_slack_settings FOR ALL
  USING (
    board_id IN (
      SELECT id FROM kanban_boards WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Add helpful comments
COMMENT ON TABLE kanban_card_comments IS 'Comments and discussions on kanban cards';
COMMENT ON TABLE kanban_card_activities IS 'Activity log for all card actions (moves, assignments, updates)';
COMMENT ON TABLE kanban_card_attachments IS 'File attachments for kanban cards';
COMMENT ON TABLE kanban_board_custom_fields IS 'Custom field definitions for boards';
COMMENT ON TABLE kanban_card_custom_field_values IS 'Custom field values for individual cards';
COMMENT ON TABLE kanban_board_slack_settings IS 'Slack notification settings per board';
