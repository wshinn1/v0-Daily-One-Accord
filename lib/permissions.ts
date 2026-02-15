// Role hierarchy and permissions system
export type UserRole =
  | "super_admin"
  | "lead_admin"
  | "admin_staff"
  | "pastoral_team"
  | "volunteer_team"
  | "media_team"
  | "member"

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  lead_admin: 80,
  admin_staff: 60,
  pastoral_team: 40,
  volunteer_team: 20,
  media_team: 15,
  member: 10,
}

export const PERMISSIONS = {
  // User management
  MANAGE_USERS: ["super_admin", "lead_admin", "admin_staff"],
  INVITE_USERS: ["super_admin", "lead_admin", "admin_staff"],
  VIEW_USERS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team"],

  // Visitor management
  MANAGE_VISITORS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team"],
  VIEW_VISITORS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team", "volunteer_team"],

  // Event management
  MANAGE_EVENTS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team"],
  VIEW_EVENTS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team", "volunteer_team", "member"],

  // Attendance management
  MANAGE_ATTENDANCE: ["super_admin", "lead_admin", "admin_staff", "pastoral_team"],
  VIEW_ATTENDANCE: ["super_admin", "lead_admin", "admin_staff", "pastoral_team", "volunteer_team"],

  // Team management
  MANAGE_TEAMS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team"],
  VIEW_TEAMS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team", "volunteer_team", "member"],

  // Newsletter management
  MANAGE_NEWSLETTERS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team"],
  VIEW_NEWSLETTERS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team", "volunteer_team", "member"],

  // Slack integration
  MANAGE_SLACK: ["super_admin", "lead_admin", "admin_staff"],
  VIEW_SLACK: ["super_admin", "lead_admin", "admin_staff", "pastoral_team"],

  // Settings
  MANAGE_SETTINGS: ["super_admin", "lead_admin"],
  VIEW_SETTINGS: ["super_admin", "lead_admin", "admin_staff"],

  // Theme customization
  MANAGE_THEME: ["super_admin", "lead_admin"],

  // Media assets
  VIEW_MEDIA_ASSETS: ["super_admin", "lead_admin", "admin_staff", "pastoral_team", "volunteer_team", "media_team"],
}

export function hasPermission(userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles.includes(userRole)
}

export function hasHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole]
}

export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  // Super admins can manage anyone
  if (managerRole === "super_admin") return true

  // Lead admins can manage everyone except super admins
  if (managerRole === "lead_admin" && targetRole !== "super_admin") return true

  // Admin staff can manage pastoral team, volunteer team, and members
  if (managerRole === "admin_staff" && ["pastoral_team", "volunteer_team", "member"].includes(targetRole)) {
    return true
  }

  return false
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    super_admin: "Super Admin",
    lead_admin: "Lead Admin",
    admin_staff: "Admin Staff",
    pastoral_team: "Pastoral Team",
    volunteer_team: "Volunteer Team",
    media_team: "Media Team",
    member: "Member",
  }
  return labels[role] || role
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    super_admin: "Full system access across all churches",
    lead_admin: "Full access to church management and settings",
    admin_staff: "Manage users, visitors, events, and day-to-day operations",
    pastoral_team: "Manage visitors, events, attendance, and ministry activities",
    volunteer_team: "View information and assist with events and activities",
    media_team: "Access to media assets and files only",
    member: "Basic access to view church information and events",
  }
  return descriptions[role] || ""
}

// Function to get user's effective role
export async function getUserEffectiveRole(userId: string, churchTenantId: string): Promise<UserRole> {
  const supabase = getSupabaseBrowserClient()

  // Check if user is super admin
  const { data: userData } = await supabase.from("users").select("role").eq("id", userId).single()

  if (userData?.role === "super_admin") {
    return "lead_admin" // Super admins have lead admin access everywhere
  }

  // Get user's role in the specific church
  const { data: memberData } = await supabase
    .from("church_members")
    .select("role")
    .eq("user_id", userId)
    .eq("church_tenant_id", churchTenantId)
    .single()

  return (memberData?.role as UserRole) || "member"
}

export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === "super_admin"
}

// Helper function to get Supabase client (assuming it's defined elsewhere)
function getSupabaseBrowserClient() {
  // Implementation of getSupabaseBrowserClient
  // This should be imported or defined based on your actual setup
}
