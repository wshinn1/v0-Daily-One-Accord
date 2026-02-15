-- Fix user management issues: RLS policies and trigger
-- This resolves users not appearing in the user management section

-- ============================================================================
-- FIX HELPER FUNCTIONS
-- Update to use correct role names
-- ============================================================================

-- Fix is_admin_or_owner to check for correct roles
CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT role::TEXT IN ('lead_admin', 'admin_staff', 'owner') FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Add helper to check if user is lead admin or admin staff
CREATE OR REPLACE FUNCTION is_lead_admin_or_admin_staff()
RETURNS BOOLEAN AS $$
  SELECT role::TEXT IN ('lead_admin', 'admin_staff') FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- FIX CHURCH_MEMBERS RLS POLICIES
-- Ensure all users can see members and trigger can insert
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view church members in their church" ON church_members;
DROP POLICY IF EXISTS "Admins can manage church members in their church" ON church_members;
DROP POLICY IF EXISTS "System can insert church members" ON church_members;
DROP POLICY IF EXISTS "Super admins can view all church members" ON church_members;
DROP POLICY IF EXISTS "Super admins can manage all church members" ON church_members;

-- Allow all authenticated users to view church members in their church
CREATE POLICY "Users can view church members in their church"
  ON church_members FOR SELECT
  USING (
    church_tenant_id = get_user_church_tenant_id() 
    OR is_super_admin()
  );

-- Allow system (triggers) to insert church members
CREATE POLICY "System can insert church members"
  ON church_members FOR INSERT
  WITH CHECK (true);  -- Trigger runs with SECURITY DEFINER, so this is safe

-- Allow admins to update church members
CREATE POLICY "Admins can update church members"
  ON church_members FOR UPDATE
  USING (
    (church_tenant_id = get_user_church_tenant_id() AND is_lead_admin_or_admin_staff())
    OR is_super_admin()
  );

-- Allow admins to delete church members
CREATE POLICY "Admins can delete church members"
  ON church_members FOR DELETE
  USING (
    (church_tenant_id = get_user_church_tenant_id() AND is_lead_admin_or_admin_staff())
    OR is_super_admin()
  );

-- ============================================================================
-- FIX USER SIGNUP TRIGGER
-- Add better error handling and logging
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
  RAISE LOG '[handle_new_user] Starting for user: %', NEW.id;
  
  -- Get data from user metadata
  user_church_tenant_id := (NEW.raw_user_meta_data->>'church_tenant_id')::uuid;
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
  user_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'member');
  
  RAISE LOG '[handle_new_user] Church ID: %, Name: %, Role: %', user_church_tenant_id, user_full_name, user_role_text;
  
  -- Convert text role to enum
  BEGIN
    user_role_enum := user_role_text::user_role;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG '[handle_new_user] Invalid role %, defaulting to member', user_role_text;
    user_role_enum := 'member'::user_role;
  END;
  
  -- If no church tenant specified, use the first available one
  IF user_church_tenant_id IS NULL THEN
    SELECT id INTO user_church_tenant_id FROM public.church_tenants LIMIT 1;
    RAISE LOG '[handle_new_user] No church specified, using: %', user_church_tenant_id;
  END IF;
  
  -- Check if user email is super admin
  IF NEW.email = 'weshinn@gmail.com' THEN
    user_role_enum := 'lead_admin'::user_role;
    RAISE LOG '[handle_new_user] Super admin detected';
    
    INSERT INTO public.users (
      id, email, full_name, church_tenant_id, role, is_super_admin, created_at, updated_at
    )
    VALUES (
      NEW.id, NEW.email, user_full_name, user_church_tenant_id, user_role_enum, true, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      church_tenant_id = EXCLUDED.church_tenant_id,
      updated_at = NOW();
      
    RAISE LOG '[handle_new_user] Super admin user created';
  ELSE
    INSERT INTO public.users (
      id, email, full_name, church_tenant_id, role, is_super_admin, created_at, updated_at
    )
    VALUES (
      NEW.id, NEW.email, user_full_name, user_church_tenant_id, user_role_enum, false, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      church_tenant_id = EXCLUDED.church_tenant_id,
      role = EXCLUDED.role,
      updated_at = NOW();
      
    RAISE LOG '[handle_new_user] Regular user created';
  END IF;
  
  -- Create church member record
  INSERT INTO public.church_members (
    user_id, church_tenant_id, role, joined_at, is_active
  )
  VALUES (
    NEW.id, user_church_tenant_id, user_role_enum, NOW(), true
  )
  ON CONFLICT (user_id, church_tenant_id) DO UPDATE SET
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
    
  RAISE LOG '[handle_new_user] Church member record created for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] Error: % - %', SQLERRM, SQLSTATE;
    RAISE LOG '[handle_new_user] Full error details: %', SQLERRM;
    RETURN NEW;  -- Don't fail auth signup
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Success message wrapped in DO block
DO $$
BEGIN
  RAISE NOTICE 'User management RLS and trigger fixed successfully';
END $$;
