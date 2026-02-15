-- Create scheduled_alerts table for Slack notifications
CREATE TABLE IF NOT EXISTS scheduled_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'daily', 'weekly', 'monthly')),
  schedule_time TIME NOT NULL,
  schedule_day_of_week INTEGER, -- 0-6 for weekly (0 = Sunday)
  schedule_day_of_month INTEGER, -- 1-31 for monthly
  next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  user_mentions TEXT[], -- Array of user IDs to mention
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alert_logs table to track execution history
CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES scheduled_alerts(id) ON DELETE CASCADE,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  slack_message_ts TEXT
);

-- Add indexes
CREATE INDEX idx_scheduled_alerts_church_tenant ON scheduled_alerts(church_tenant_id);
CREATE INDEX idx_scheduled_alerts_next_run ON scheduled_alerts(next_run_at) WHERE is_active = TRUE;
CREATE INDEX idx_alert_logs_alert_id ON alert_logs(alert_id);

-- Enable RLS
ALTER TABLE scheduled_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_alerts
CREATE POLICY "Users can view alerts for their church"
  ON scheduled_alerts FOR SELECT
  TO authenticated
  USING (church_tenant_id IN (
    SELECT church_tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can create alerts"
  ON scheduled_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update alerts"
  ON scheduled_alerts FOR UPDATE
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete alerts"
  ON scheduled_alerts FOR DELETE
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('lead_admin', 'admin')
    )
  );

-- RLS Policies for alert_logs
CREATE POLICY "Users can view alert logs for their church"
  ON alert_logs FOR SELECT
  TO authenticated
  USING (
    alert_id IN (
      SELECT id FROM scheduled_alerts 
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );
