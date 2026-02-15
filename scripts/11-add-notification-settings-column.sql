-- Add notification_settings column to slack_integrations table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'slack_integrations' 
    AND column_name = 'notification_settings'
  ) THEN
    ALTER TABLE slack_integrations 
    ADD COLUMN notification_settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;
