-- Script to automatically add weshinn@gmail.com to all church tenants
-- This ensures the super admin has access to all tenants for management purposes

-- Step 1: Add weshinn@gmail.com to all existing church tenants
DO $$
DECLARE
  super_admin_id UUID;
  tenant_record RECORD;
BEGIN
  -- Get the user ID for weshinn@gmail.com
  SELECT id INTO super_admin_id
  FROM users
  WHERE email = 'weshinn@gmail.com'
  LIMIT 1;

  -- If the user exists, add them to all church tenants
  IF super_admin_id IS NOT NULL THEN
    -- Loop through all church tenants
    FOR tenant_record IN SELECT id FROM church_tenants LOOP
      -- Insert into church_members if not already exists
      INSERT INTO church_members (
        church_tenant_id,
        user_id,
        role,
        joined_at
      )
      VALUES (
        tenant_record.id,
        super_admin_id,
        'lead_admin',
        NOW()
      )
      ON CONFLICT (church_tenant_id, user_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Successfully added weshinn@gmail.com to all church tenants';
  ELSE
    RAISE NOTICE 'User weshinn@gmail.com not found. They will be added when they sign up.';
  END IF;
END $$;

-- Step 2: Create a trigger function to automatically add super admin to new tenants
CREATE OR REPLACE FUNCTION add_super_admin_to_new_tenant()
RETURNS TRIGGER AS $$
DECLARE
  super_admin_id UUID;
BEGIN
  -- Get the user ID for weshinn@gmail.com
  SELECT id INTO super_admin_id
  FROM users
  WHERE email = 'weshinn@gmail.com'
  LIMIT 1;

  -- If the super admin user exists, add them to the new tenant
  IF super_admin_id IS NOT NULL THEN
    INSERT INTO church_members (
      church_tenant_id,
      user_id,
      role,
      joined_at
    )
    VALUES (
      NEW.id,
      super_admin_id,
      'lead_admin',
      NOW()
    )
    ON CONFLICT (church_tenant_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger
DROP TRIGGER IF EXISTS auto_add_super_admin_trigger ON church_tenants;
CREATE TRIGGER auto_add_super_admin_trigger
  AFTER INSERT ON church_tenants
  FOR EACH ROW
  EXECUTE FUNCTION add_super_admin_to_new_tenant();

-- Verify the setup
DO $$
DECLARE
  super_admin_id UUID;
  tenant_count INTEGER;
  membership_count INTEGER;
BEGIN
  SELECT id INTO super_admin_id FROM users WHERE email = 'weshinn@gmail.com' LIMIT 1;
  
  IF super_admin_id IS NOT NULL THEN
    SELECT COUNT(*) INTO tenant_count FROM church_tenants;
    SELECT COUNT(*) INTO membership_count 
    FROM church_members 
    WHERE user_id = super_admin_id;
    
    RAISE NOTICE 'Super admin setup complete:';
    RAISE NOTICE '  - Total church tenants: %', tenant_count;
    RAISE NOTICE '  - Super admin memberships: %', membership_count;
  END IF;
END $$;
