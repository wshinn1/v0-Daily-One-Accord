import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CampaignDonationForm } from "@/components/giving/campaign-donation-form"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Calendar, Target, Users } from "lucide-react"

export default async function CampaignPage({
  params,
}: {
  params: { churchSlug: string; campaignId: string }
}) {
  const supabase = await createServerClient()

  // Get giving settings to find church tenant
  const { data: settings } = await supabase
    .from("giving_settings")
    .select("church_tenant_id, primary_color, logo_url")
    .eq("public_page_slug", params.churchSlug)
    .single()

  if (!settings) {
    notFound()
  }

  // Get campaign details
  const { data: campaign } = await supabase
    .from("giving_campaigns")
    .select("*")
    .eq("id", params.campaignId)
    .eq("church_tenant_id", settings.church_tenant_id)
    .eq("is_active", true)
    .single()

  if (!campaign) {
    notFound()
  }

  // Get donation count for this campaign
  const { count: donorCount } = await supabase
    .from("donations")
    .select("*", { count: "only", head: true })
    .eq("campaign_id", campaign.id)
    .eq("status", "succeeded")

  const progress = Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {campaign.image_url && (
          <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
            <img
              src={campaign.image_url || "/placeholder.svg"}
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-lg text-muted-foreground whitespace-pre-wrap">{campaign.description}</p>
              )}
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{formatCurrency(campaign.current_amount / 100)}</span>
                    <span className="text-muted-foreground">of {formatCurrency(campaign.goal_amount / 100)} goal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">{donorCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Donors</div>
                    </div>
                  </div>

                  {daysLeft !== null && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-2xl font-bold">{daysLeft}</div>
                        <div className="text-xs text-muted-foreground">Days Left</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency((campaign.goal_amount - campaign.current_amount) / 100)}
                      </div>
                      <div className="text-xs text-muted-foreground">To Go</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Suspense fallback={<div>Loading donation form...</div>}>
              <CampaignDonationForm
                churchTenantId={settings.church_tenant_id}
                campaignId={campaign.id}
                campaignName={campaign.name}
                primaryColor={settings.primary_color}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
