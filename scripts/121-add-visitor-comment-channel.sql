-- Add visitor_comment_channel to slack_notification_settings
DO $$
BEGIN
  -- Check if the visitor_comment column exists in notification_settings jsonb
  -- We'll add it as a new key in the notification_settings jsonb field
  
  -- Update existing slack_integrations to add visitor_comment_channel to notification_settings
  UPDATE slack_integrations
  SET notification_settings = 
    CASE 
      WHEN notification_settings IS NULL THEN 
        '{"visitor_comment_channel": null}'::jsonb
      WHEN NOT notification_settings ? 'visitor_comment_channel' THEN
        notification_settings || '{"visitor_comment_channel": null}'::jsonb
      ELSE 
        notification_settings
    END
  WHERE is_active = true;

  RAISE NOTICE 'Added visitor_comment_channel to slack notification_settings';
END $$;
