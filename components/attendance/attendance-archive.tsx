"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface AttendanceRecord {
  id: string
  event: { title: string; event_type: string }
  category: { name: string }
  count: number
  recorded_at: string
  notes: string | null
  custom_fields: any
}

interface AttendanceArchiveProps {
  churchTenantId: string
}

export function AttendanceArchive({ churchTenantId }: AttendanceArchiveProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [eventTypeFilter, setEventTypeFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchRecords()
  }, [churchTenantId])

  useEffect(() => {
    filterRecords()
  }, [records, searchTerm, eventTypeFilter, dateFrom, dateTo])

  const fetchRecords = async () => {
    const { data } = await supabase
      .from("attendance_by_category")
      .select(`
        *,
        event:events(title, event_type),
        category:attendance_categories(name)
      `)
      .eq("church_tenant_id", churchTenantId)
      .order("recorded_at", { ascending: false })

    if (data) {
      setRecords(data)
    }
  }

  const filterRecords = () => {
    let filtered = records

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.category.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (eventTypeFilter !== "all") {
      filtered = filtered.filter((r) => r.event.event_type === eventTypeFilter)
    }

    if (dateFrom) {
      filtered = filtered.filter((r) => new Date(r.recorded_at) >= new Date(dateFrom))
    }

    if (dateTo) {
      filtered = filtered.filter((r) => new Date(r.recorded_at) <= new Date(dateTo))
    }

    setFilteredRecords(filtered)
  }

  const getEventTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      service: "bg-blue-500",
      class: "bg-green-500",
      meeting: "bg-purple-500",
      other: "bg-gray-500",
    }
    return <Badge className={colors[type] || colors.other}>{type}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Archive</CardTitle>
        <CardDescription>View and search historical attendance records</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Date</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.recorded_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{record.event.title}</TableCell>
                    <TableCell>{getEventTypeBadge(record.event.event_type)}</TableCell>
                    <TableCell>{record.category.name}</TableCell>
                    <TableCell className="text-right">{record.count}</TableCell>
                    <TableCell className="text-muted-foreground">{record.notes || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </CardContent>
    </Card>
  )
}
