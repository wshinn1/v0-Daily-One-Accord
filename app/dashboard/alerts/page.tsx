import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ScheduledAlertsManager } from "@/components/alerts/scheduled-alerts-manager"

export default async function AlertsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    redirect("/dashboard")
  }

  // Check if user is admin
  const isAdmin = userData.role === "lead_admin" || userData.role === "admin"

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scheduled Slack Alerts</h1>
        <p className="text-muted-foreground">Create and manage automated Slack notifications for your team</p>
      </div>

      <ScheduledAlertsManager isAdmin={isAdmin} />
    </div>
  )
}
