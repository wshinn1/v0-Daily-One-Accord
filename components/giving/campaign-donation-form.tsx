"use client"

import { DonationForm } from "./donation-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CampaignDonationFormProps {
  churchTenantId: string
  campaignId: string
  campaignName: string
  primaryColor?: string
}

export function CampaignDonationForm({
  churchTenantId,
  campaignId,
  campaignName,
  primaryColor,
}: CampaignDonationFormProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Support This Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <DonationForm churchTenantId={churchTenantId} campaignId={campaignId} primaryColor={primaryColor} />
      </CardContent>
    </Card>
  )
}
