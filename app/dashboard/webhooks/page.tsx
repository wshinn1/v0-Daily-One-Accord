import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WebhookManagement } from "@/components/webhooks/webhook-management"

export default async function WebhooksPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    redirect("/login")
  }

  // Check permissions
  const hasPermission = ["admin", "pastor", "elder"].includes(userData.role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <p className="text-muted-foreground mt-2">
          Configure webhooks to receive real-time notifications about events in your church management system
        </p>
      </div>

      <WebhookManagement hasPermission={hasPermission} />
    </div>
  )
}
