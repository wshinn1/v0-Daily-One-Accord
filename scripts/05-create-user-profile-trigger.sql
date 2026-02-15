-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_tenant_id uuid;
BEGIN
  -- Get the first church tenant (or create a default one if none exists)
  SELECT id INTO default_tenant_id FROM public.church_tenants LIMIT 1;
  
  -- If no tenant exists, create a default one
  IF default_tenant_id IS NULL THEN
    INSERT INTO public.church_tenants (name, slug)
    VALUES ('Default Church', 'default-church')
    RETURNING id INTO default_tenant_id;
  END IF;

  -- Check if user email is the super admin email
  IF NEW.email = 'weshinn@gmail.com' THEN
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
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Super Admin'),
      default_tenant_id,
      'admin',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
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
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      default_tenant_id,
      'member',
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to run after user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
