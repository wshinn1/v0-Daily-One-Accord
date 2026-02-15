import { Suspense } from "react"
import { GivingAnalyticsDashboard } from "@/components/giving/giving-analytics-dashboard"

export default function GivingAnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading analytics...</div>}>
        <GivingAnalyticsDashboard />
      </Suspense>
    </div>
  )
}
