"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Calendar, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  display_order: number
}

interface CategoryAttendanceRecord {
  id: string
  event_id: string
  category_id: string
  count: number
  recorded_at: string
  notes: string | null
}

interface Event {
  id: string
  title: string
  start_time: string
}

interface CategoryAttendanceSpreadsheetProps {
  churchTenantId: string
}

export function CategoryAttendanceSpreadsheet({ churchTenantId }: CategoryAttendanceSpreadsheetProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [attendanceData, setAttendanceData] = useState<Map<string, number>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [churchTenantId])

  const fetchData = async () => {
    setLoading(true)
    console.log("[v0] Fetching category attendance data for tenant:", churchTenantId)

    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("attendance_categories")
      .select("*")
      .eq("church_tenant_id", churchTenantId)
      .eq("is_active", true)
      .order("display_order")

    console.log("[v0] Categories found:", categoriesData?.length || 0, "Error:", categoriesError)
    console.log(
      "[v0] Category IDs:",
      categoriesData?.map((c) => ({ id: c.id, name: c.name })),
    )

    // Fetch recent events
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("id, title, start_time")
      .eq("church_tenant_id", churchTenantId)
      .order("start_time", { ascending: false })
      .limit(20)

    console.log("[v0] Events found:", eventsData?.length || 0, "Error:", eventsError)
    console.log(
      "[v0] Event IDs:",
      eventsData?.map((e) => ({ id: e.id, title: e.title })),
    )

    // Fetch attendance records
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from("attendance_by_category")
      .select("*")
      .eq("church_tenant_id", churchTenantId)

    console.log("[v0] Attendance records found:", attendanceRecords?.length || 0, "Error:", attendanceError)
    console.log("[v0] Attendance records:", attendanceRecords)

    if (categoriesData) setCategories(categoriesData)
    if (eventsData) setEvents(eventsData)

    // Build attendance map
    const map = new Map<string, number>()
    attendanceRecords?.forEach((record) => {
      const key = `${record.event_id}-${record.category_id}`
      console.log("[v0] Adding to map:", key, "Count:", record.count)
      map.set(key, record.count)
    })
    console.log("[v0] Final attendance map size:", map.size)
    console.log("[v0] Map contents:", Array.from(map.entries()))
    setAttendanceData(map)
    setLoading(false)
  }

  const updateCount = (eventId: string, categoryId: string, value: string) => {
    const key = `${eventId}-${categoryId}`
    const count = Number.parseInt(value) || 0
    const newMap = new Map(attendanceData)
    newMap.set(key, count)
    setAttendanceData(newMap)
    setHasChanges(true)
  }

  const saveChanges = async () => {
    try {
      // Fetch existing records
      const { data: existingRecords } = await supabase
        .from("attendance_by_category")
        .select("id, event_id, category_id, count")
        .eq("church_tenant_id", churchTenantId)

      const existingMap = new Map<string, { id: string; count: number }>()
      existingRecords?.forEach((record) => {
        const key = `${record.event_id}-${record.category_id}`
        existingMap.set(key, { id: record.id, count: record.count })
      })

      const toInsert: any[] = []
      const toUpdate: any[] = []

      events.forEach((event) => {
        categories.forEach((category) => {
          const key = `${event.id}-${category.id}`
          const newCount = attendanceData.get(key) || 0
          const existing = existingMap.get(key)

          if (newCount > 0) {
            if (existing) {
              // Update if count changed
              if (existing.count !== newCount) {
                toUpdate.push({
                  id: existing.id,
                  count: newCount,
                })
              }
            } else {
              // Insert new record
              toInsert.push({
                church_tenant_id: churchTenantId,
                event_id: event.id,
                category_id: category.id,
                count: newCount,
                recorded_at: new Date().toISOString(),
              })
            }
          }
        })
      })

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from("attendance_by_category").insert(toInsert)
        if (insertError) throw insertError
      }

      for (const update of toUpdate) {
        const { error: updateError } = await supabase
          .from("attendance_by_category")
          .update({ count: update.count })
          .eq("id", update.id)
        if (updateError) throw updateError
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

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Attendance</CardTitle>
          <CardDescription>No attendance categories found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create attendance categories in the Slack Form Builder to start tracking category-based attendance.
          </p>
        </CardContent>
      </Card>
    )
  }

  console.log("[v0] Rendering spreadsheet with:", {
    categories: categories.length,
    events: events.length,
    attendanceMapSize: attendanceData.size,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Category-based attendance tracking</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {hasChanges && (
            <Button onClick={saveChanges} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="w-full border rounded-lg">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="flex border-b bg-muted/50 sticky top-0 z-10">
            <div className="w-48 p-3 font-semibold border-r bg-background flex-shrink-0">Event / Date</div>
            {categories.map((category) => (
              <div key={category.id} className="w-32 p-3 text-center border-r flex-shrink-0">
                <div className="font-semibold text-sm">{category.name}</div>
              </div>
            ))}
            <div className="w-32 p-3 text-center font-semibold flex-shrink-0">Total</div>
          </div>

          {/* Data Rows */}
          {events.map((event, idx) => {
            const rowTotal = categories.reduce((sum, category) => {
              const key = `${event.id}-${category.id}`
              return sum + (attendanceData.get(key) || 0)
            }, 0)

            console.log("[v0] Rendering row for event:", event.id, event.title, "Total:", rowTotal)

            return (
              <div
                key={event.id}
                className={`flex border-b hover:bg-muted/30 transition-colors ${
                  idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                }`}
              >
                <div className="w-48 p-3 border-r flex-shrink-0">
                  <div className="font-medium text-sm truncate">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(event.start_time), "MMM d, yyyy")}
                  </div>
                </div>
                {categories.map((category) => {
                  const key = `${event.id}-${category.id}`
                  const value = attendanceData.get(key) || 0
                  console.log("[v0] Cell:", key, "Value:", value)
                  return (
                    <div key={category.id} className="w-32 p-2 border-r flex-shrink-0 flex items-center justify-center">
                      <Input
                        type="number"
                        min="0"
                        value={value || ""}
                        onChange={(e) => updateCount(event.id, category.id, e.target.value)}
                        className="h-8 text-center"
                        placeholder="0"
                      />
                    </div>
                  )
                })}
                <div className="w-32 p-3 flex-shrink-0 flex items-center justify-center font-semibold">{rowTotal}</div>
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No events found. Create events to start tracking attendance.</p>
        </div>
      )}
    </div>
  )
}
