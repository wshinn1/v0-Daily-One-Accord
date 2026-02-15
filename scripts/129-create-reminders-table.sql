-- Create reminders table for kanban card follow-ups
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_channels TEXT[] NOT NULL DEFAULT ARRAY['slack'], -- 'slack', 'email', or both
  message TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_reminders_card_id ON reminders(card_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_church_tenant_id ON reminders(church_tenant_id);
CREATE INDEX idx_reminders_reminder_time ON reminders(reminder_time) WHERE is_sent = FALSE;
CREATE INDEX idx_reminders_pending ON reminders(is_sent, reminder_time);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reminders for their church"
  ON reminders FOR SELECT
  TO authenticated
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
