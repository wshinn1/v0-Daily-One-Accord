import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CampaignsView } from "@/components/giving/campaigns-view"

export const metadata = {
  title: "Campaigns | Giving",
  description: "Manage fundraising campaigns",
}

export default async function CampaignsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground">Create and manage fundraising campaigns</p>
      </div>

      <Suspense fallback={<div>Loading campaigns...</div>}>
        <CampaignsView churchTenantId={userData.church_tenant_id} />
      </Suspense>
    </div>
  )
}
