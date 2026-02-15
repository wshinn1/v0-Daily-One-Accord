-- Add archived status to rundowns
ALTER TABLE event_rundowns 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add index for archived rundowns
CREATE INDEX IF NOT EXISTS idx_event_rundowns_archived ON event_rundowns(church_tenant_id, is_archived);

-- Add comment
COMMENT ON COLUMN event_rundowns.is_archived IS 'Whether this rundown has been archived';

SELECT 'Archived status column added to event_rundowns table' AS status;
