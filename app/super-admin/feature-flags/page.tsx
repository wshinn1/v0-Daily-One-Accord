import { Suspense } from "react"
import { FeatureFlagsView } from "@/components/super-admin/feature-flags-view"

export default function FeatureFlagsPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Loading feature flags...</div>}>
        <FeatureFlagsView />
      </Suspense>
    </div>
  )
}
