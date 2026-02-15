-- Add calendar integration for classes

-- Fixed table name from calendar_events to events
-- Add calendar_event_id to classes table to link with calendar events
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS calendar_event_id UUID REFERENCES events(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_classes_calendar_event ON classes(calendar_event_id);

-- Add comment
COMMENT ON COLUMN classes.calendar_event_id IS 'Links class to a calendar event for scheduling';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Class calendar integration added successfully';
END $$;
