// Helper functions for checking menu visibility based on role

export interface MenuItem {
  key: string
  name: string
  category: "sidebar" | "dashboard"
  group_name?: string
  description?: string
  icon?: string
  href: string
  is_external?: boolean
  display_order: number
}

export interface VisibilitySetting {
  id: string
  church_tenant_id: string
  menu_item_key: string
  role: string
  is_visible: boolean
}

/**
 * Check if a menu item is visible for a specific role
 * @param menuItemKey - The key of the menu item
 * @param userRole - The user's role
 * @param visibilitySettings - Array of visibility settings for the tenant
 * @returns boolean - true if visible, false if hidden
 */
export function isMenuItemVisible(
  menuItemKey: string,
  userRole: string,
  visibilitySettings: VisibilitySetting[],
): boolean {
  // Super admins can see everything
  if (userRole === "super_admin") {
    return true
  }

  // Find the specific setting for this menu item and role
  const setting = visibilitySettings.find((s) => s.menu_item_key === menuItemKey && s.role === userRole)

  // If no setting exists, default to visible (allow by default)
  if (!setting) {
    return true
  }

  return setting.is_visible
}

/**
 * Filter menu items based on visibility settings
 * @param menuItems - Array of all menu items
 * @param userRole - The user's role
 * @param visibilitySettings - Array of visibility settings for the tenant
 * @param category - Optional filter by category ('sidebar' or 'dashboard')
 * @returns Filtered array of visible menu items
 */
export function filterVisibleMenuItems(
  menuItems: MenuItem[],
  userRole: string,
  visibilitySettings: VisibilitySetting[],
  category?: "sidebar" | "dashboard",
): MenuItem[] {
  let filtered = menuItems

  // Filter by category if specified
  if (category) {
    filtered = filtered.filter((item) => item.category === category)
  }

  // Filter by visibility
  filtered = filtered.filter((item) => isMenuItemVisible(item.key, userRole, visibilitySettings))

  return filtered
}

/**
 * Get default visibility for all roles
 * Used when initializing a new tenant
 */
export function getDefaultVisibilitySettings(): Record<string, boolean> {
  return {
    // Lead admin can see everything
    lead_admin: true,
    // Admin staff can see most things
    admin_staff: true,
    // Volunteers have limited access
    volunteer: false,
    // Members have minimal access
    member: false,
  }
}
