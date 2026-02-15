import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DonationForm } from "@/components/giving/donation-form"

interface PageProps {
  params: {
    churchSlug: string
  }
  searchParams: {
    config?: string
  }
}

export default async function EmbedGivingPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()

  // Fetch church by slug
  const { data: church, error } = await supabase
    .from("church_tenants")
    .select("id, name, slug")
    .eq("slug", params.churchSlug)
    .single()

  if (error || !church) {
    notFound()
  }

  // Check if church has Stripe connected
  const { data: stripeConnection } = await supabase
    .from("stripe_connections")
    .select("stripe_account_id, is_active")
    .eq("church_tenant_id", church.id)
    .single()

  if (!stripeConnection?.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Giving Not Available</h2>
          <p className="text-sm text-muted-foreground">Online giving is not currently set up for this church.</p>
        </div>
      </div>
    )
  }

  // Parse optional config
  let config = {
    primaryColor: "#3b82f6",
    showHeader: true,
    headerText: `Give to ${church.name}`,
  }

  if (searchParams.config) {
    try {
      config = { ...config, ...JSON.parse(decodeURIComponent(searchParams.config)) }
    } catch (e) {
      console.error("Failed to parse config:", e)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {config.showHeader && (
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: config.primaryColor }}>
              {config.headerText}
            </h1>
          </div>
        )}

        <DonationForm churchTenantId={church.id} primaryColor={config.primaryColor} />
      </div>
    </div>
  )
}
