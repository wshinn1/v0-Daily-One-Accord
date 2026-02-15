-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_church_tenant_id uuid;
  v_role text;
BEGIN
  -- Check if this is the super admin email
  IF NEW.email = 'weshinn@gmail.com' THEN
    v_role := 'super_admin';
    v_church_tenant_id := NULL;
  ELSE
    -- For other users, assign to a default church or require manual assignment
    v_role := 'member';
    -- Get the first church tenant (you can modify this logic)
    SELECT id INTO v_church_tenant_id FROM church_tenants LIMIT 1;
  END IF;

  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name, role, church_tenant_id, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_role,
    v_church_tenant_id,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
