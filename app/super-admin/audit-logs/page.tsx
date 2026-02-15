import { Suspense } from "react"
import { AuditLogsView } from "@/components/super-admin/audit-logs-view"

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Loading audit logs...</div>}>
        <AuditLogsView />
      </Suspense>
    </div>
  )
}
