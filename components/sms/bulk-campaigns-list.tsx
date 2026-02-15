"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users } from "lucide-react"

interface BulkCampaignsListProps {
  campaigns: any[]
  churchTenantId: string
}

export function BulkCampaignsList({ campaigns, churchTenantId }: BulkCampaignsListProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      sending: "default",
      completed: "outline",
      failed: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No bulk campaigns</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {campaign.name}
                  {getStatusBadge(campaign.status)}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(campaign.created_at).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {campaign.recipient_type.replace("_", " ")}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{campaign.message}</p>
            {campaign.status === "completed" && (
              <div className="mt-2 text-xs text-muted-foreground">
                Sent to {campaign.sent_count} of {campaign.total_recipients} recipients
                {campaign.failed_count > 0 && ` (${campaign.failed_count} failed)`}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
