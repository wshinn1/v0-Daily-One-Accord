-- Add missing status column to visitors table
-- This column is required for the visitor kanban board functionality

-- Add the status column with the visitor_status enum type
ALTER TABLE visitors 
ADD COLUMN IF NOT EXISTS status visitor_status DEFAULT 'new';

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'visitors'
  AND column_name = 'status';
