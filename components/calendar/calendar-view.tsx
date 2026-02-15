"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, CalendarIcon, List } from "lucide-react"
import { AddEventDialog } from "./add-event-dialog"
import { EditEventDialog } from "./edit-event-dialog"
import { EventCard } from "./event-card"
import { CalendarGrid } from "./calendar-grid"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Event {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  leader: { id: string; full_name: string } | null
  creator: { id: string; full_name: string } | null
  max_attendees: number | null
  is_public: boolean
  allow_registration: boolean
}

interface Leader {
  id: string
  full_name: string
}

interface CalendarViewProps {
  initialEvents: Event[]
  leaders: Leader[]
  churchTenantId: string
  currentUserId: string
}

export function CalendarView({ initialEvents, leaders, churchTenantId, currentUserId }: CalendarViewProps) {
  const [events, setEvents] = useState(initialEvents)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    console.log("[v0] CalendarView mounted with", events.length, "events")
  }, [events.length])

  const handleAddEvent = async (eventData: any) => {
    const { data, error } = await supabase
      .from("events")
      .insert({
        ...eventData,
        church_tenant_id: churchTenantId,
        created_by: currentUserId,
      })
      .select("*, leader:leader_id(id, full_name), creator:created_by(id, full_name)")
      .single()

    if (!error && data) {
      setEvents([...events, data].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()))
    }
  }

  const handleUpdateEvent = async (id: string, updates: Partial<Event>) => {
    const { error } = await supabase.from("events").update(updates).eq("id", id)

    if (!error) {
      setEvents(events.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    }
  }

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (!error) {
      setEvents(events.filter((e) => e.id !== id))
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsAddDialogOpen(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsEditDialogOpen(true)
  }

  const upcomingEvents = events.filter((e) => new Date(e.start_time) >= new Date())
  const pastEvents = events.filter((e) => new Date(e.start_time) < new Date())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar & Events</h2>
          <p className="text-muted-foreground">Manage church events and schedules</p>
        </div>
        <Button
          onClick={() => {
            setSelectedDate(null)
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="w-4 h-4" />
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarGrid events={events} onDateClick={handleDateClick} onEventClick={handleEventClick} />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    leaders={leaders}
                    onUpdate={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
                    churchTenantId={churchTenantId}
                  />
                ))}
              </div>
            )}
          </div>

          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Past Events</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.slice(0, 6).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    leaders={leaders}
                    onUpdate={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
                    churchTenantId={churchTenantId}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddEventDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddEvent}
        leaders={leaders}
        selectedDate={selectedDate}
      />

      {selectedEvent && (
        <EditEventDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          event={selectedEvent}
          leaders={leaders}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  )
}
