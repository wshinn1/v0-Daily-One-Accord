import { Suspense } from "react"
import { DonorManagement } from "@/components/giving/donor-management"

export const metadata = {
  title: "Donor Management | Daily One Accord",
  description: "Manage your church donors and giving history",
}

export default function DonorsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading donors...</div>}>
        <DonorManagement />
      </Suspense>
    </div>
  )
}
