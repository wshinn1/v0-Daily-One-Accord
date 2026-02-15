"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, MessageSquare, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SendClassSMSDialog } from "./send-class-sms-dialog"

interface ClassRosterViewProps {
  enrollments: any[]
  classData: any
  churchTenantId: string
}

export function ClassRosterView({ enrollments, classData, churchTenantId }: ClassRosterViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSMSDialog, setShowSMSDialog] = useState(false)

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      enrollment.user.full_name?.toLowerCase().includes(searchLower) ||
      enrollment.user.email?.toLowerCase().includes(searchLower) ||
      enrollment.user.phone?.toLowerCase().includes(searchLower)
    )
  })

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Enrollment Date", "Status"]
    const rows = enrollments.map((e) => [
      e.user.full_name || "",
      e.user.email || "",
      e.user.phone || "",
      new Date(e.enrollment_date).toLocaleDateString(),
      e.status || "active",
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${classData.name.replace(/\s+/g, "_")}_roster.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const enrolledWithPhone = enrollments.filter((e) => e.user.phone).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={enrollments.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSMSDialog(true)} disabled={enrolledWithPhone === 0}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send SMS ({enrolledWithPhone})
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No students found matching your search" : "No students enrolled yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{enrollment.user.full_name || "—"}</TableCell>
                  <TableCell>{enrollment.user.email || "—"}</TableCell>
                  <TableCell>{enrollment.user.phone || "—"}</TableCell>
                  <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                      {enrollment.status || "active"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SendClassSMSDialog
        open={showSMSDialog}
        onOpenChange={setShowSMSDialog}
        enrollments={enrollments.filter((e) => e.user.phone)}
        classData={classData}
        churchTenantId={churchTenantId}
      />
    </div>
  )
}
