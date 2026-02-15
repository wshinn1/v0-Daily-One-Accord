import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DonationForm } from "@/components/giving/donation-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface PageProps {
  params: {
    churchSlug: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient()

  const { data: church } = await supabase.from("church_tenants").select("name").eq("slug", params.churchSlug).single()

  return {
    title: `Give to ${church?.name || "Church"} | Daily One Accord`,
    description: `Support ${church?.name || "our church"} with a secure online donation`,
    openGraph: {
      title: `Give to ${church?.name || "Church"}`,
      description: `Support ${church?.name || "our church"} with a secure online donation`,
      type: "website",
    },
  }
}

function DonationFormSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  )
}

export default async function PublicGivingPage({ params }: PageProps) {
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
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Giving Not Available</h1>
        <p className="text-muted-foreground">Online giving is not currently set up for this church.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{church.name}</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Your generosity helps us continue our mission and serve our community
            </p>
          </div>

          <Suspense fallback={<DonationFormSkeleton />}>
            <DonationForm churchTenantId={church.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
