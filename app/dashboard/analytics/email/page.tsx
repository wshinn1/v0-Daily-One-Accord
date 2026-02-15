import { Suspense } from "react"
import { EmailAnalyticsDashboard } from "@/components/email/email-analytics-dashboard"

export default function EmailAnalyticsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Analytics</h1>
        <p className="text-muted-foreground">Track email performance, engagement metrics, and delivery statistics</p>
      </div>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <EmailAnalyticsDashboard />
      </Suspense>
    </div>
  )
}
