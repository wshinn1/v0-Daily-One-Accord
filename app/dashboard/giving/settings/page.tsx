import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { StripeConnectionSettings } from "@/components/giving/stripe-connection-settings"
import { GivingEmbedCodeGenerator } from "@/components/giving/giving-embed-code-generator"

export default async function GivingSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user?.id).single()

  // Get church tenant info for name and slug
  const { data: churchTenant } = await supabase
    .from("church_tenants")
    .select("name, slug")
    .eq("id", userData?.church_tenant_id || "")
    .single()

  const churchSlug = churchTenant?.slug || ""
  const churchName = churchTenant?.name || ""

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Giving Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your giving configuration and integrations</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <StripeConnectionSettings />
      </Suspense>

      {churchSlug && (
        <Suspense fallback={<div>Loading...</div>}>
          <GivingEmbedCodeGenerator churchSlug={churchSlug} churchName={churchName} />
        </Suspense>
      )}
    </div>
  )
}
