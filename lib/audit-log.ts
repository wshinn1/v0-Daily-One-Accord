import { createClient } from "@/lib/supabase/server"

export type AuditAction =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.invited"
  | "tenant.created"
  | "tenant.updated"
  | "tenant.deleted"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled"
  | "feature_flag.enabled"
  | "feature_flag.disabled"
  | "settings.updated"
  | "integration.connected"
  | "integration.disconnected"
  | "auth.login"
  | "auth.logout"
  | "auth.password_reset"

interface AuditLogParams {
  action: AuditAction
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("[v0] Cannot create audit log: No authenticated user")
      return
    }

    // Get user details
    const { data: userData } = await supabase.from("users").select("email, church_tenant_id").eq("id", user.id).single()

    // Insert audit log
    const { error } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_email: userData?.email || user.email,
      church_tenant_id: userData?.church_tenant_id,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      details: params.details,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
    })

    if (error) {
      console.error("[v0] Failed to create audit log:", error)
    }
  } catch (error) {
    console.error("[v0] Error creating audit log:", error)
  }
}
