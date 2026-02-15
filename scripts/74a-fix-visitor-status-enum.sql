-- Part 1: Fix visitor_status enum values
-- Run this script first, then run 74b

DO $$ 
BEGIN
  -- Add missing enum values if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'follow_up' 
    AND enumtypid = 'visitor_status'::regtype
  ) THEN
    ALTER TYPE visitor_status ADD VALUE 'follow_up';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'engaged' 
    AND enumtypid = 'visitor_status'::regtype
  ) THEN
    ALTER TYPE visitor_status ADD VALUE 'engaged';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'contacted' 
    AND enumtypid = 'visitor_status'::regtype
  ) THEN
    ALTER TYPE visitor_status ADD VALUE 'contacted';
  END IF;
END $$;

-- Show current enum values
SELECT enumlabel as visitor_status_values
FROM pg_enum
WHERE enumtypid = 'visitor_status'::regtype
ORDER BY enumsortorder;
