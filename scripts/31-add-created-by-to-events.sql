-- Add created_by column to events table to track who created each event

ALTER TABLE events
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_events_created_by ON events(created_by);

-- Update existing events to set created_by to the leader_id if available
UPDATE events
SET created_by = leader_id
WHERE created_by IS NULL AND leader_id IS NOT NULL;
