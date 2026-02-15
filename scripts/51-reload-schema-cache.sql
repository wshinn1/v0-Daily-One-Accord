-- Force Supabase to reload the schema cache
-- This makes the user_invitations table visible to the API

-- First, verify the table exists and is in the public schema
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_invitations'
  ) THEN
    RAISE NOTICE 'user_invitations table exists in public schema';
  ELSE
    RAISE EXCEPTION 'user_invitations table does not exist!';
  END IF;
END $$;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Show table info
SELECT 
  schemaname,
  tablename,
  tableowner,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_invitations';

SELECT 'Schema cache reload triggered. Wait 10 seconds then try the users page again.' as status;
