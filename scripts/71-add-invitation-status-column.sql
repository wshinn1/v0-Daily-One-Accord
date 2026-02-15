-- Add status column to user_invitations if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_invitations' AND column_name = 'status'
  ) THEN
    ALTER TABLE user_invitations 
    ADD COLUMN status TEXT DEFAULT 'pending';
    
    COMMENT ON COLUMN user_invitations.status IS 'Invitation status: pending, accepted, expired, cancelled';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_invitations' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE user_invitations 
    ADD COLUMN accepted_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN user_invitations.accepted_at IS 'Timestamp when invitation was accepted';
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
