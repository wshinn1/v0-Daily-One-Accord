"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, Target, Share2, Edit } from "lucide-react"
import { CreateCampaignDialog } from "./create-campaign-dialog"
import { formatCurrency } from "@/lib/utils"
import { formatDate } from "@/lib/date-utils"
import { useRouter } from "next/navigation"

interface Campaign {
  id: string
  name: string
  description: string | null
  goal_amount: number
  current_amount: number
  start_date: string
  end_date: string | null
  is_active: boolean
  image_url: string | null
  thank_you_message: string | null
  created_at: string
}

export function CampaignsView({ churchTenantId }: { churchTenantId: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    loadCampaigns()
  }, [churchTenantId])

  async function loadCampaigns() {
    setLoading(true)
    const { data, error } = await supabase
      .from("giving_campaigns")
      .select("*")
      .eq("church_tenant_id", churchTenantId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading campaigns:", error)
    } else {
      setCampaigns(data || [])
    }
    setLoading(false)
  }

  function getProgressPercentage(current: number, goal: number) {
    return Math.min((current / goal) * 100, 100)
  }

  function getCampaignStatus(campaign: Campaign) {
    if (!campaign.is_active) return "inactive"
    const now = new Date()
    const startDate = new Date(campaign.start_date)
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null

    if (now < startDate) return "upcoming"
    if (endDate && now > endDate) return "ended"
    return "active"
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Active", variant: "default" },
      upcoming: { label: "Upcoming", variant: "secondary" },
      ended: { label: "Ended", variant: "outline" },
      inactive: { label: "Inactive", variant: "destructive" },
    }
    const config = variants[status] || variants.inactive
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return <div>Loading campaigns...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first fundraising campaign to start raising funds for specific goals.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const status = getCampaignStatus(campaign)
            const progress = getProgressPercentage(campaign.current_amount, campaign.goal_amount)

            return (
              <Card
                key={campaign.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/giving/campaigns/${campaign.id}`)}
              >
                {campaign.image_url && (
                  <div className="h-48 bg-muted relative">
                    <img
                      src={campaign.image_url || "/placeholder.svg"}
                      alt={campaign.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    {getStatusBadge(status)}
                  </div>
                  {campaign.description && (
                    <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{formatCurrency(campaign.current_amount / 100)}</span>
                      <span className="text-muted-foreground">of {formatCurrency(campaign.goal_amount / 100)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(new Date(campaign.start_date), "MMM d, yyyy")}
                        {campaign.end_date && ` - ${formatDate(new Date(campaign.end_date), "MMM d, yyyy")}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/giving/campaigns/${campaign.id}`)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/giving/campaigns/${campaign.id}?tab=sharing`)
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CreateCampaignDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        churchTenantId={churchTenantId}
        onSuccess={loadCampaigns}
      />
    </div>
  )
}
