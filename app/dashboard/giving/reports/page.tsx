import { Suspense } from "react"
import { GivingReports } from "@/components/giving/giving-reports"

export default function GivingReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading reports...</div>}>
        <GivingReports />
      </Suspense>
    </div>
  )
}
