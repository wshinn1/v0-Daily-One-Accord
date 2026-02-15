-- Diagnostic script to check event_rundowns table structure
-- Run this to see what columns currently exist

SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'event_rundowns'
ORDER BY ordinal_position;
