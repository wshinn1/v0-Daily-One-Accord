"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceList } from "./attendance-list"
import { AttendanceAnalytics } from "./attendance-analytics"
import { AttendanceSpreadsheet } from "./attendance-spreadsheet"
import { CategoryAttendanceSpreadsheet } from "./category-attendance-spreadsheet"
import { AddAttendanceDialog } from "./add-attendance-dialog"
import { AddCategoryAttendanceDialog } from "./add-category-attendance-dialog"
import { EventManagement } from "./event-management"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { SlackFormBuilder } from "./slack-form-builder"
import { AttendanceArchive } from "./attendance-archive"

interface Event {
  id: string
  title: string
  start_time: string
}

interface Member {
  id: string
  full_name: string
}

interface AttendanceRecord {
  id: string
  event: { title: string; start_time: string }
  user: { full_name: string }
  attended_at: string
  notes: string | null
}

interface Category {
  id: string
  name: string
  description: string | null
}

interface AttendanceViewProps {
  events: Event[]
  members: Member[]
  attendance: AttendanceRecord[]
  churchTenantId: string
}

export function AttendanceView({
  events,
  members,
  attendance: initialAttendance,
  churchTenantId,
}: AttendanceViewProps) {
  const [attendance, setAttendance] = useState(initialAttendance)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("attendance_categories")
        .select("*")
        .eq("church_tenant_id", churchTenantId)
        .eq("is_active", true)
        .order("display_order")

      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [churchTenantId])

  const handleAddAttendance = async (attendanceData: any) => {
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        ...attendanceData,
        church_tenant_id: churchTenantId,
      })
      .select("*, event:events(title, start_time), user:users(full_name)")
      .single()

    if (!error && data) {
      setAttendance([data, ...attendance])
    }
  }

  const handleDeleteAttendance = async (id: string) => {
    const { error } = await supabase.from("attendance").delete().eq("id", id)

    if (!error) {
      setAttendance(attendance.filter((a) => a.id !== id))
    }
  }

  const handleCategoryAttendanceAdded = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Tracking</h2>
          <p className="text-muted-foreground">Track and analyze church attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
            <Users className="w-4 h-4 mr-2" />
            By Category
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Individual
          </Button>
        </div>
      </div>

      <EventManagement events={events} churchTenantId={churchTenantId} />

      <Tabs defaultValue="category-spreadsheet" className="space-y-6">
        <TabsList>
          <TabsTrigger value="category-spreadsheet">Attendance</TabsTrigger>
          <TabsTrigger value="spreadsheet">Individual Tracking</TabsTrigger>
          <TabsTrigger value="list">Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
          <TabsTrigger value="form-builder">Slack Form</TabsTrigger>
        </TabsList>

        <TabsContent value="category-spreadsheet" className="space-y-4">
          <CategoryAttendanceSpreadsheet churchTenantId={churchTenantId} />
        </TabsContent>

        <TabsContent value="spreadsheet" className="space-y-4">
          <AttendanceSpreadsheet
            events={events}
            members={members}
            attendance={attendance}
            churchTenantId={churchTenantId}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <AttendanceList attendance={attendance} onDelete={handleDeleteAttendance} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AttendanceAnalytics attendance={attendance} events={events} members={members} />
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <AttendanceArchive churchTenantId={churchTenantId} />
        </TabsContent>

        <TabsContent value="form-builder" className="space-y-4">
          <SlackFormBuilder churchTenantId={churchTenantId} />
        </TabsContent>
      </Tabs>

      <AddCategoryAttendanceDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onAdd={handleCategoryAttendanceAdded}
        events={events}
        categories={categories}
        churchTenantId={churchTenantId}
      />

      <AddAttendanceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddAttendance}
        events={events}
        members={members}
      />
    </div>
  )
}
