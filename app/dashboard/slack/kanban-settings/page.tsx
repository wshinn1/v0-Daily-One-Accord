import { getSupabaseServiceRole } from "@/lib/supabase/service-role"
import { redirect } from "next/navigation"
import { KanbanNotificationSettings } from "@/components/slack/kanban-notification-settings"

export default async function KanbanSlackSettingsPage() {
  console.log("[v0] 🟦 Kanban Settings Page - START")

  try {
    const supabase = getSupabaseServiceRole()
    const supabaseAuth = await (await import("@/lib/supabase/server")).getSupabaseServerClient()

    console.log("[v0] 🟦 Kanban Settings Page - Getting user...")
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()

    if (!user) {
      console.log("[v0] 🔴 Kanban Settings Page - No user found, redirecting to login")
      redirect("/login")
    }

    console.log("[v0] 🟦 Kanban Settings Page - User ID:", user.id)

    let userData
    try {
      const { data, error: userError } = await supabase
        .from("users")
        .select("church_tenant_id, role, is_super_admin")
        .eq("id", user.id)
        .single()

      console.log("[v0] 🟦 Kanban Settings Page - User data query result:", data)
      console.log("[v0] 🟦 Kanban Settings Page - User data error:", userError)

      if (userError) {
        console.error("[v0] 🔴 Kanban Settings Page - User data query error:", userError)
        throw userError
      }

      userData = data
    } catch (error) {
      console.error("[v0] 🔴 Kanban Settings Page - Failed to fetch user data:", error)
      redirect("/dashboard")
    }

    if (!userData) {
      console.log("[v0] 🔴 Kanban Settings Page - No user data found, redirecting to dashboard")
      redirect("/dashboard")
    }

    console.log("[v0] 🟦 Kanban Settings Page - User role:", userData.role)
    console.log("[v0] 🟦 Kanban Settings Page - Is super admin:", userData.is_super_admin)
    console.log("[v0] 🟦 Kanban Settings Page - Church tenant ID:", userData.church_tenant_id)

    // Allow super_admin, admin, lead_admin, and staff to access
    const allowedRoles = ["super_admin", "admin", "lead_admin", "staff"]
    if (!allowedRoles.includes(userData.role) && !userData.is_super_admin) {
      console.log("[v0] 🔴 Kanban Settings Page - Insufficient permissions, role:", userData.role)
      redirect("/dashboard")
    }

    console.log("[v0] 🟢 Kanban Settings Page - User has access, role:", userData.role)

    let slackConfig
    try {
      const { data, error: slackError } = await supabase
        .from("slack_integrations")
        .select("*")
        .eq("church_tenant_id", userData.church_tenant_id)
        .maybeSingle()

      console.log("[v0] 🟦 Kanban Settings Page - Slack config query result:", data ? "Found" : "Not found")
      console.log("[v0] 🟦 Kanban Settings Page - Slack config error:", slackError)

      if (slackError) {
        console.error("[v0] 🔴 Kanban Settings Page - Slack config query error:", slackError)
        throw slackError
      }

      slackConfig = data
    } catch (error) {
      console.error("[v0] 🔴 Kanban Settings Page - Failed to fetch Slack config:", error)
      return (
        <div className="container py-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">Error Loading Slack Settings</h1>
            <p className="text-muted-foreground mb-6">
              Failed to load Slack configuration. Please try again or contact support.
            </p>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </div>
        </div>
      )
    }

    let channels = []
    try {
      console.log("[v0] 🟦 Kanban Settings Page - Querying slack_channels table...")
      const { data, error: channelsError } = await supabase
        .from("slack_channels")
        .select("*")
        .eq("church_tenant_id", userData.church_tenant_id)

      console.log("[v0] 🟦 Kanban Settings Page - Channels query result:", data?.length || 0, "channels")
      console.log("[v0] 🟦 Kanban Settings Page - Channels error:", channelsError)

      if (channelsError) {
        console.error("[v0] 🔴 Kanban Settings Page - Channels query error:", channelsError)
        // Don't throw - just use empty array
        console.log("[v0] 🟡 Kanban Settings Page - Continuing with empty channels array")
      } else {
        channels = data || []
      }
    } catch (error) {
      console.error("[v0] 🔴 Kanban Settings Page - Failed to fetch channels:", error)
      // Don't throw - just use empty array
      console.log("[v0] 🟡 Kanban Settings Page - Continuing with empty channels array")
    }

    if (!slackConfig) {
      console.log("[v0] 🟡 Kanban Settings Page - No Slack config found, showing setup message")
      return (
        <div className="container py-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">Kanban Slack Notifications</h1>
            <p className="text-muted-foreground mb-6">
              Connect Slack first to enable kanban notifications. Go to Settings → Integrations → Slack to get started.
            </p>
          </div>
        </div>
      )
    }

    console.log("[v0] 🟢 Kanban Settings Page - Rendering component with config and", channels.length, "channels")

    return (
      <div className="container py-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Slack Notifications</h1>
          <p className="text-muted-foreground mb-6">Configure how your team receives updates in Slack</p>

          <KanbanNotificationSettings slackConfig={slackConfig} channels={channels || []} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] 🔴 Kanban Settings Page - Unhandled error:", error)
    console.error(
      "[v0] 🔴 Kanban Settings Page - Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    )

    return (
      <div className="container py-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Error Loading Page</h1>
          <p className="text-muted-foreground mb-6">
            An unexpected error occurred while loading the Kanban settings page.
          </p>
          <pre className="bg-muted p-4 rounded text-sm overflow-auto">
            {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}
