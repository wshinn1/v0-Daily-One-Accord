import { Suspense } from "react"
import { GivingDashboard } from "@/components/giving/giving-dashboard"
import { GivingDashboardSkeleton } from "@/components/giving/giving-dashboard-skeleton"

export default function GivingPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<GivingDashboardSkeleton />}>
        <GivingDashboard />
      </Suspense>
    </div>
  )
}
