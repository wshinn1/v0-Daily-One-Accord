import { Suspense } from "react"
import { FundManagement } from "@/components/giving/fund-management"

export default function FundsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <FundManagement />
      </Suspense>
    </div>
  )
}
