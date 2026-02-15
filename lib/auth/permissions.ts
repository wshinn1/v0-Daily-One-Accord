import { createServerClient } from "@/lib/supabase/server"

export interface AuthenticatedUser {
  id: string
  email: string
  is_super_admin: boolean
  role: string | null
  church_tenant_id: string | null
  full_name: string | null
}

export interface PermissionCheckOptions {
  requireSuperAdmin?: boolean
  requireRoles?: string[]
  requireChurchTenant?: boolean
}

/**
 * Gets the authenticated user and their permissions from the users table.
 * This should be used by all API routes to ensure consistent permission checking.
 *
 * @returns AuthenticatedUser object with permissions, or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createServerClient()

  // Get the authenticated user from Supabase Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Fetch user details from the users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, email, is_super_admin, role, church_tenant_id, full_name")
    .eq("id", user.id)
    .single()

  if (userError || !userData) {
    console.error("[v0] User not found in users table:", user.id)
    return null
  }

  return {
    id: userData.id,
    email: userData.email,
    is_super_admin: userData.is_super_admin || false,
    role: userData.role,
    church_tenant_id: userData.church_tenant_id,
    full_name: userData.full_name,
  }
}

/**
 * Checks if the authenticated user has the required permissions.
 *
 * @param options - Permission requirements
 * @returns AuthenticatedUser if authorized, throws error if not
 */
export async function requireAuth(options: PermissionCheckOptions = {}): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check super admin requirement
  if (options.requireSuperAdmin && !user.is_super_admin) {
    throw new Error("Insufficient permissions")
  }

  // Check role requirement
  if (options.requireRoles && options.requireRoles.length > 0) {
    if (!user.role || !options.requireRoles.includes(user.role)) {
      // Super admins bypass role checks
      if (!user.is_super_admin) {
        throw new Error("Insufficient permissions")
      }
    }
  }

  // Check church tenant requirement
  if (options.requireChurchTenant && !user.church_tenant_id) {
    throw new Error("No church tenant associated with user")
  }

  return user
}

/**
 * Checks if a user can access a specific church tenant's resources.
 * Super admins can access any tenant, others can only access their own.
 */
export function canAccessTenant(user: AuthenticatedUser, tenantId: string): boolean {
  if (user.is_super_admin) {
    return true
  }
  return user.church_tenant_id === tenantId
}

/**
 * Checks if the authenticated user is a super admin.
 * Throws an error if not authenticated or not a super admin.
 *
 * @returns AuthenticatedUser if super admin, throws error if not
 */
export async function checkSuperAdmin(): Promise<AuthenticatedUser> {
  return await requireAuth({ requireSuperAdmin: true })
}
