import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmailSettingsForm } from "@/components/email/email-settings-form"

export default async function EmailSettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get church tenant
  const { data: churchMember } = await supabase
    .from("church_members")
    .select("church_tenant_id, church_tenants(*)")
    .eq("user_id", user.id)
    .single()

  if (!churchMember) {
    redirect("/dashboard")
  }

  const churchTenant = churchMember.church_tenants as any

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Email Settings
        </h1>
        <p className="text-muted-foreground mt-2">Customize your church's email branding and templates</p>
      </div>

      <EmailSettingsForm churchTenant={churchTenant} />
    </div>
  )
}
