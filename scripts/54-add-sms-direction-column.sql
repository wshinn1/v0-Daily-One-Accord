-- Add direction column to track inbound vs outbound messages
ALTER TABLE sms_logs 
ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound'));

-- Note: error_message column already exists in script 52, but adding IF NOT EXISTS for safety
ALTER TABLE sms_logs 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Fixed index to use telnyx_message_id instead of message_id
-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_sms_logs_telnyx_message_id ON sms_logs(telnyx_message_id);

SELECT 'SMS logs table updated with direction and error tracking' AS result;
