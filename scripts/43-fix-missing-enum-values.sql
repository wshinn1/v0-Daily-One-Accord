-- Add missing values to user_role enum if they don't exist
DO $$ 
BEGIN
  -- Add 'admin' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
    RAISE NOTICE 'Added admin to user_role enum';
  ELSE
    RAISE NOTICE 'admin already exists in user_role enum';
  END IF;

  -- Add 'pastor' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'pastor'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'pastor';
    RAISE NOTICE 'Added pastor to user_role enum';
  ELSE
    RAISE NOTICE 'pastor already exists in user_role enum';
  END IF;

  -- Add 'elder' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'elder'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'elder';
    RAISE NOTICE 'Added elder to user_role enum';
  ELSE
    RAISE NOTICE 'elder already exists in user_role enum';
  END IF;

  -- Add 'staff' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'staff'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'staff';
    RAISE NOTICE 'Added staff to user_role enum';
  ELSE
    RAISE NOTICE 'staff already exists in user_role enum';
  END IF;

  -- Add 'volunteer' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'volunteer'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'volunteer';
    RAISE NOTICE 'Added volunteer to user_role enum';
  ELSE
    RAISE NOTICE 'volunteer already exists in user_role enum';
  END IF;

  -- Add 'member' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'member'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'member';
    RAISE NOTICE 'Added member to user_role enum';
  ELSE
    RAISE NOTICE 'member already exists in user_role enum';
  END IF;
END $$;

-- Add missing values to visitor_status enum if they don't exist
DO $$ 
BEGIN
  -- Add 'new' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'visitor_status' AND e.enumlabel = 'new'
  ) THEN
    ALTER TYPE visitor_status ADD VALUE 'new';
    RAISE NOTICE 'Added new to visitor_status enum';
  ELSE
    RAISE NOTICE 'new already exists in visitor_status enum';
  END IF;

  -- Add 'contacted' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'visitor_status' AND e.enumlabel = 'contacted'
  ) THEN
    ALTER TYPE visitor_status ADD VALUE 'contacted';
    RAISE NOTICE 'Added contacted to visitor_status enum';
  ELSE
    RAISE NOTICE 'contacted already exists in visitor_status enum';
  END IF;

  -- Add 'returning' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'visitor_status' AND e.enumlabel = 'returning'
  ) THEN
    ALTER TYPE visitor_status ADD VALUE 'returning';
    RAISE NOTICE 'Added returning to visitor_status enum';
  ELSE
    RAISE NOTICE 'returning already exists in visitor_status enum';
  END IF;

  -- Add 'member' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'visitor_status' AND e.enumlabel = 'member'
  ) THEN
    ALTER TYPE visitor_status ADD VALUE 'member';
    RAISE NOTICE 'Added member to visitor_status enum';
  ELSE
    RAISE NOTICE 'member already exists in visitor_status enum';
  END IF;
END $$;

-- Verify the enums now have all values
SELECT 'user_role enum values:' as info;
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

SELECT 'visitor_status enum values:' as info;
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'visitor_status'
ORDER BY e.enumsortorder;
