import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CampaignAnalyticsDashboard } from "@/components/giving/campaign-analytics-dashboard"
import { CampaignSharingTools } from "@/components/giving/campaign-sharing-tools"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CampaignDetailPage({ params }: { params: { campaignId: string } }) {
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

  // Get church tenant info for slug
  const { data: churchTenant } = await supabase
    .from("church_tenants")
    .select("slug")
    .eq("id", userData.church_tenant_id)
    .single()

  const { data: campaign } = await supabase
    .from("giving_campaigns")
    .select("*")
    .eq("id", params.campaignId)
    .eq("church_tenant_id", userData.church_tenant_id)
    .single()

  if (!campaign) {
    redirect("/dashboard/giving/campaigns")
  }

  const churchSlug = churchTenant?.slug || "church"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/giving/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground">Campaign details and analytics</p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Suspense fallback={<div>Loading analytics...</div>}>
            <CampaignAnalyticsDashboard campaignId={params.campaignId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="sharing">
          <CampaignSharingTools campaignId={params.campaignId} campaignName={campaign.name} churchSlug={churchSlug} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
