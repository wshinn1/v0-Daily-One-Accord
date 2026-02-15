import { Suspense } from "react"
import { DonationHistory } from "@/components/giving/donation-history"

export const metadata = {
  title: "Donation History | Daily One Accord",
  description: "View all donations and transaction history",
}

export default function DonationsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading donations...</div>}>
        <DonationHistory />
      </Suspense>
    </div>
  )
}
