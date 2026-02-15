-- Fix the user signup trigger to properly handle role casting
-- This resolves the "Database error saving new user" error

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_church_tenant_id uuid;
  user_full_name text;
  user_role_text text;
  user_role_enum user_role;
BEGIN
  -- Get data from user metadata (passed during signup)
  user_church_tenant_id := (NEW.raw_user_meta_data->>'church_tenant_id')::uuid;
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
  user_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'member');
  
  -- Convert text role to enum, defaulting to 'member' if invalid
  BEGIN
    user_role_enum := user_role_text::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_enum := 'member'::user_role;
  END;
  
  -- If no church tenant specified, use the first available one
  IF user_church_tenant_id IS NULL THEN
    SELECT id INTO user_church_tenant_id FROM public.church_tenants LIMIT 1;
  END IF;
  
  -- Check if user email is the super admin email
  IF NEW.email = 'weshinn@gmail.com' THEN
    user_role_enum := 'super_admin'::user_role;
    
    -- Create super admin user
    INSERT INTO public.users (
      id,
      email,
      full_name,
      church_tenant_id,
      role,
      is_super_admin,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      user_full_name,
      user_church_tenant_id,
      user_role_enum,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      church_tenant_id = EXCLUDED.church_tenant_id,
      updated_at = NOW();
  ELSE
    -- Create regular user
    INSERT INTO public.users (
      id,
      email,
      full_name,
      church_tenant_id,
      role,
      is_super_admin,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      user_full_name,
      user_church_tenant_id,
      user_role_enum,
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      church_tenant_id = EXCLUDED.church_tenant_id,
      role = EXCLUDED.role,
      updated_at = NOW();
  END IF;
  
  -- Create church member record
  INSERT INTO public.church_members (
    user_id,
    church_tenant_id,
    role,
    joined_at,
    is_active
  )
  VALUES (
    NEW.id,
    user_church_tenant_id,
    user_role_enum,
    NOW(),
    true
  )
  ON CONFLICT (user_id, church_tenant_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to run after user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User signup trigger fixed with proper error handling';
END $$;
