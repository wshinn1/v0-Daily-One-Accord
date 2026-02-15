-- Check if slack_channels table exists and show its structure

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'slack_channels'
) as table_exists;

-- If table exists, show all columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'slack_channels'
ORDER BY ordinal_position;

-- If table exists, show row count
SELECT COUNT(*) as total_channels
FROM slack_channels;

-- If table exists, show sample data
SELECT *
FROM slack_channels
LIMIT 5;
