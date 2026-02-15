-- Check if user_invitations table exists and show its structure
SELECT 
  'Table exists: ' || CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_invitations'
  ) THEN 'YES' ELSE 'NO' END as table_status;

-- Show all columns if table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_invitations'
ORDER BY ordinal_position;

-- Show all policies on the table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'user_invitations';

-- Show RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'user_invitations';
