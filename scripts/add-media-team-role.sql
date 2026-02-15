-- Add media_team role to the user_role enum
-- This allows users to be assigned the media_team role which restricts them to only viewing media assets

-- Add the new enum value
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'media_team';

-- Verify the enum values
DO $$
BEGIN
  RAISE NOTICE 'user_role enum values updated successfully';
END $$;
