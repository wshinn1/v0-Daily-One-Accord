"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Calendar, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  start_time: string
  is_default_service?: boolean
  event_type?: string
}

interface Member {
  id: string
  full_name: string
}

interface AttendanceRecord {
  id: string
  event_id: string
  user_id: string
  attended_at: string
}

interface AttendanceSpreadsheetProps {
  events: Event[]
  members: Member[]
  attendance: AttendanceRecord[]
  churchTenantId: string
}

export function AttendanceSpreadsheet({
  events,
  members,
  attendance: initialAttendance,
  churchTenantId,
}: AttendanceSpreadsheetProps) {
  const [attendanceMap, setAttendanceMap] = useState<Map<string, boolean>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    const map = new Map<string, boolean>()
    initialAttendance.forEach((record) => {
      const key = `${record.user_id}-${record.event_id}`
      map.set(key, true)
    })
    setAttendanceMap(map)
  }, [initialAttendance])

  const toggleAttendance = (userId: string, eventId: string) => {
    const key = `${userId}-${eventId}`
    const newMap = new Map(attendanceMap)
    newMap.set(key, !newMap.get(key))
    setAttendanceMap(newMap)
    setHasChanges(true)
  }

  const saveChanges = async () => {
    try {
      const { data: currentRecords } = await supabase
        .from("attendance")
        .select("id, user_id, event_id")
        .eq("church_tenant_id", churchTenantId)

      const currentMap = new Map<string, string>()
      currentRecords?.forEach((record) => {
        const key = `${record.user_id}-${record.event_id}`
        currentMap.set(key, record.id)
      })

      const toInsert: any[] = []
      const toDelete: string[] = []

      members.forEach((member) => {
        events.forEach((event) => {
          const key = `${member.id}-${event.id}`
          const isChecked = attendanceMap.get(key) || false
          const existingId = currentMap.get(key)

          if (isChecked && !existingId) {
            toInsert.push({
              church_tenant_id: churchTenantId,
              user_id: member.id,
              event_id: event.id,
              attended_at: new Date().toISOString(),
            })
          } else if (!isChecked && existingId) {
            toDelete.push(existingId)
          }
        })
      })

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from("attendance").insert(toInsert)
        if (insertError) throw insertError
      }

      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase.from("attendance").delete().in("id", toDelete)
        if (deleteError) throw deleteError
      }

      const churchServiceEvents = events.filter(
        (event) => event.is_default_service || event.event_type === "church_service",
      )

      for (const event of churchServiceEvents) {
        const attendanceCount = Array.from(attendanceMap.entries()).filter(
          ([key, isChecked]) => isChecked && key.endsWith(`-${event.id}`),
        ).length

        if (attendanceCount > 0) {
          try {
            await fetch("/api/attendance/notify-slack", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                church_tenant_id: churchTenantId,
                event_id: event.id,
                attendance_count: attendanceCount,
                event_title: event.title,
                event_date: format(new Date(event.start_time), "MMMM d, yyyy"),
              }),
            })
          } catch (error) {
            console.error("[v0] Error sending Slack notification:", error)
          }
        }
      }

      setHasChanges(false)
      toast({
        title: "Success",
        description: "Attendance records saved successfully",
      })
    } catch (error) {
      console.error("[v0] Error saving attendance:", error)
      toast({
        title: "Error",
        description: "Failed to save attendance records",
        variant: "destructive",
      })
    }
  }

  const sortedEvents = [...events].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
  const recentEvents = sortedEvents.slice(0, 10)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Showing {recentEvents.length} most recent events</span>
        </div>
        {hasChanges && (
          <Button onClick={saveChanges} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <ScrollArea className="w-full border rounded-lg">
        <div className="min-w-max">
          <div className="flex border-b bg-muted/50 sticky top-0 z-10">
            <div className="w-48 p-3 font-semibold border-r bg-background flex-shrink-0">Member Name</div>
            {recentEvents.map((event) => (
              <div key={event.id} className="w-40 p-3 text-center border-r flex-shrink-0">
                <div className="font-semibold text-sm truncate">{event.title}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(event.start_time), "MMM d, yyyy")}</div>
              </div>
            ))}
          </div>

          {members.map((member, idx) => (
            <div
              key={member.id}
              className={`flex border-b hover:bg-muted/30 transition-colors ${
                idx % 2 === 0 ? "bg-background" : "bg-muted/10"
              }`}
            >
              <div className="w-48 p-3 border-r font-medium flex-shrink-0 flex items-center">{member.full_name}</div>
              {recentEvents.map((event) => {
                const key = `${member.id}-${event.id}`
                const isChecked = attendanceMap.get(key) || false
                return (
                  <div key={event.id} className="w-40 p-3 border-r flex-shrink-0 flex items-center justify-center">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleAttendance(member.id, event.id)}
                      className="h-5 w-5"
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {members.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No members found. Add members to start tracking attendance.</p>
        </div>
      )}

      {recentEvents.length === 0 && members.length > 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No events found. Create events to start tracking attendance.</p>
        </div>
      )}
    </div>
  )
}
