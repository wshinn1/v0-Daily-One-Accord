import { createServerClient } from "@/lib/supabase/server"

export type ActivityType = "login" | "page_view" | "feature_use" | "api_call" | "business_plan_view"

interface TrackActivityParams {
  userId: string
  tenantId?: string
  activityType: ActivityType
  activityDetails?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function trackActivity({
  userId,
  tenantId,
  activityType,
  activityDetails,
  ipAddress,
  userAgent,
}: TrackActivityParams) {
  try {
    const supabase = await createServerClient()

    // Insert activity log
    const { error: logError } = await supabase.from("user_activity_logs").insert({
      user_id: userId,
      church_tenant_id: tenantId,
      activity_type: activityType,
      activity_details: activityDetails,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    if (logError) {
      console.error("[v0] Error logging activity:", logError)
    }

    // Update user's last activity timestamp
    const updates: any = {
      last_activity_at: new Date().toISOString(),
    }

    // If it's a login, update login-specific fields
    if (activityType === "login") {
      updates.last_login_at = new Date().toISOString()

      // Increment login count
      const { data: userData } = await supabase.from("users").select("login_count").eq("id", userId).single()

      if (userData) {
        updates.login_count = (userData.login_count || 0) + 1
      }
    }

    const { error: updateError } = await supabase.from("users").update(updates).eq("id", userId)

    if (updateError) {
      console.error("[v0] Error updating user activity:", updateError)
    }
  } catch (error) {
    console.error("[v0] Activity tracking error:", error)
  }
}

export async function getActivityAnalytics(tenantId?: string) {
  try {
    const supabase = await createServerClient()

    let query = supabase.from("user_engagement_analytics").select("*").order("last_activity_at", { ascending: false })

    if (tenantId) {
      query = query.eq("church_tenant_id", tenantId)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching analytics:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("[v0] Analytics fetch error:", error)
    return []
  }
}
