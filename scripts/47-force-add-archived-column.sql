-- Force add is_archived column to event_rundowns table
-- This will add the column even if script 45 didn't work

DO $$ 
BEGIN
  -- Check if column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'event_rundowns' 
      AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE event_rundowns 
    ADD COLUMN is_archived BOOLEAN DEFAULT false NOT NULL;
    
    RAISE NOTICE 'Added is_archived column to event_rundowns table';
  ELSE
    RAISE NOTICE 'is_archived column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'event_rundowns'
  AND column_name = 'is_archived';
