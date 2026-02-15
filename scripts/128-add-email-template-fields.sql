-- Add missing fields to email_templates table for automated email templates

ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS body TEXT;

-- Add comment
COMMENT ON COLUMN email_templates.template_type IS 'Type of template: welcome, event_confirmation, newsletter, notification, reminder, custom';
COMMENT ON COLUMN email_templates.subject IS 'Email subject line with variable support';
COMMENT ON COLUMN email_templates.body IS 'Email body content with variable support';
