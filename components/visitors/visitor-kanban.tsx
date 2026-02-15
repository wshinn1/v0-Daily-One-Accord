"use client"

import { useState } from "react"
import { DndContext, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { KanbanColumn } from "./kanban-column"
import { VisitorCard } from "./visitor-card"
import { AddVisitorDialog } from "./add-visitor-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Visitor {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: "new" | "follow_up" | "engaged"
  notes: string | null
  first_visit_date: string | null
  assigned_to: { id: string; full_name: string } | null
  position: number
  due_date: string | null
}

interface StaffMember {
  id: string
  full_name: string
}

interface VisitorKanbanProps {
  initialVisitors: Visitor[]
  staffMembers: StaffMember[]
  churchTenantId: string
  currentUserId: string // Add currentUserId prop
}

export function VisitorKanban({ initialVisitors, staffMembers, churchTenantId, currentUserId }: VisitorKanbanProps) {
  const [visitors, setVisitors] = useState(initialVisitors)
  const [activeVisitor, setActiveVisitor] = useState<Visitor | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const supabase = getSupabaseBrowserClient()

  console.log("[v0] VisitorKanban loaded with staff members:", staffMembers.length)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const columns = [
    { id: "new", title: "New Visitors", status: "new" as const, color: "blue" as const },
    { id: "follow_up", title: "Needs Follow Up", status: "follow_up" as const, color: "amber" as const },
    { id: "engaged", title: "Engaged Visitors", status: "engaged" as const, color: "emerald" as const },
  ]

  const getVisitorsByStatus = (status: string) => {
    return visitors.filter((v) => v.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const visitor = visitors.find((v) => v.id === event.active.id)
    setActiveVisitor(visitor || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveVisitor(null)

    if (!over) return

    const activeVisitor = visitors.find((v) => v.id === active.id)
    if (!activeVisitor) return

    const newStatus = over.id as "new" | "follow_up" | "engaged"

    if (activeVisitor.status !== newStatus) {
      const oldStatus = activeVisitor.status

      // Update locally
      const updatedVisitors = visitors.map((v) => (v.id === activeVisitor.id ? { ...v, status: newStatus } : v))
      setVisitors(updatedVisitors)

      // Update in database
      await supabase.from("visitors").update({ status: newStatus }).eq("id", activeVisitor.id)

      try {
        const statusLabels = {
          new: "New Visitors",
          follow_up: "Needs Follow Up",
          engaged: "Engaged Visitors",
        }

        await fetch("/api/slack/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: churchTenantId,
            eventType: "visitor_status_changed",
            data: {
              visitor_name: activeVisitor.full_name,
              old_status: statusLabels[oldStatus],
              new_status: statusLabels[newStatus],
              visitor_email: activeVisitor.email,
              visitor_phone: activeVisitor.phone,
            },
          }),
        })
      } catch (error) {
        console.error("[v0] Failed to send status change notification:", error)
      }
    }
  }

  const handleAddVisitor = async (visitorData: any) => {
    console.log("[v0] ===== STARTING ADD VISITOR FLOW =====")
    console.log("[v0] Visitor data received:", visitorData)
    console.log("[v0] Church tenant ID:", churchTenantId)
    console.log("[v0] Staff members available:", staffMembers.length)

    const { data, error } = await supabase
      .from("visitors")
      .insert({
        ...visitorData,
        church_tenant_id: churchTenantId,
        status: "new",
        position: visitors.filter((v) => v.status === "new").length,
      })
      .select("*, assigned_to:users(id, full_name)")
      .single()

    if (error) {
      console.error("[v0] ❌ Error adding visitor to database:", error)
      return
    }

    if (data) {
      console.log("[v0] ✅ Visitor added to database successfully:", data)
      setVisitors([...visitors, data])

      console.log("[v0] ----- SENDING SLACK NOTIFICATION -----")
      try {
        const notificationPayload = {
          tenantId: churchTenantId,
          eventType: "new_visitor",
          data: {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            notes: data.notes,
          },
        }
        console.log("[v0] Notification payload:", JSON.stringify(notificationPayload, null, 2))

        const response = await fetch("/api/slack/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notificationPayload),
        })

        console.log("[v0] Slack API response status:", response.status)
        console.log("[v0] Slack API response ok:", response.ok)

        const result = await response.json()
        console.log("[v0] Slack API response body:", JSON.stringify(result, null, 2))

        if (!response.ok) {
          console.error("[v0] ❌ Slack notification failed with status:", response.status)
          console.error("[v0] Error details:", result)
        } else if (result.skipped) {
          console.log("[v0] ⚠️ Slack notification skipped:", result.reason)
        } else {
          console.log("[v0] ✅ Slack notification sent successfully")
        }
      } catch (error) {
        console.error("[v0] ❌ Exception while sending Slack notification:", error)
        if (error instanceof Error) {
          console.error("[v0] Error message:", error.message)
          console.error("[v0] Error stack:", error.stack)
        }
      }

      if (data.assigned_to) {
        console.log("[v0] ----- SENDING ASSIGNMENT NOTIFICATION -----")
        console.log("[v0] Assigned to:", data.assigned_to)
        try {
          const assignmentPayload = {
            tenantId: churchTenantId,
            visitorId: data.id,
            visitorName: data.full_name,
            assignedToId: visitorData.assigned_to,
            assignedToName: data.assigned_to.full_name,
          }
          console.log("[v0] Assignment payload:", JSON.stringify(assignmentPayload, null, 2))

          const response = await fetch("/api/visitors/notify-assignment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assignmentPayload),
          })

          console.log("[v0] Assignment API response status:", response.status)
          const result = await response.json()
          console.log("[v0] Assignment API response body:", JSON.stringify(result, null, 2))

          if (!response.ok) {
            console.error("[v0] ❌ Assignment notification failed:", response.status, result)
          } else if (result.skipped) {
            console.log("[v0] ⚠️ Assignment notification skipped:", result.reason)
          } else {
            console.log("[v0] ✅ Assignment notification sent successfully")
          }
        } catch (error) {
          console.error("[v0] ❌ Exception while sending assignment notification:", error)
          if (error instanceof Error) {
            console.error("[v0] Error message:", error.message)
            console.error("[v0] Error stack:", error.stack)
          }
        }
      } else {
        console.log("[v0] No assignment - skipping assignment notification")
      }

      console.log("[v0] ===== ADD VISITOR FLOW COMPLETE =====")
    }
  }

  const handleUpdateVisitor = async (id: string, updates: Partial<Visitor>) => {
    console.log("[v0] Updating visitor:", id, updates)

    // Get the current visitor to check if assignment changed
    const currentVisitor = visitors.find((v) => v.id === id)
    const assignmentChanged =
      updates.assigned_to !== undefined && currentVisitor?.assigned_to?.id !== (updates.assigned_to as any)

    const dbUpdates: any = { ...updates }
    if ("assigned_to" in updates) {
      // If assigned_to is a string (UUID), use it directly
      // If it's null, set to null
      // If it's an object, extract the id
      if (typeof updates.assigned_to === "string") {
        dbUpdates.assigned_to = updates.assigned_to
      } else if (updates.assigned_to === null) {
        dbUpdates.assigned_to = null
      } else if (updates.assigned_to && typeof updates.assigned_to === "object" && "id" in updates.assigned_to) {
        dbUpdates.assigned_to = (updates.assigned_to as any).id
      }
    }

    console.log("[v0] Database updates:", dbUpdates)

    const { error, data } = await supabase
      .from("visitors")
      .update(dbUpdates)
      .eq("id", id)
      .select("*, assigned_to:users(id, full_name)")
      .single()

    if (error) {
      console.error("[v0] Error updating visitor:", error)
      return
    }

    if (data) {
      setVisitors(visitors.map((v) => (v.id === id ? data : v)))

      if (assignmentChanged && dbUpdates.assigned_to) {
        const assignedMember = staffMembers.find((m) => m.id === dbUpdates.assigned_to)
        if (assignedMember) {
          try {
            await fetch("/api/visitors/notify-assignment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tenantId: churchTenantId,
                visitorId: id,
                visitorName: currentVisitor?.full_name,
                assignedToId: dbUpdates.assigned_to,
                assignedToName: assignedMember.full_name,
              }),
            })
            console.log("[v0] Assignment notification sent for update")
          } catch (error) {
            console.error("[v0] Failed to send assignment notification:", error)
          }
        }
      }
    }
  }

  const handleDeleteVisitor = async (id: string) => {
    const { error } = await supabase.from("visitors").delete().eq("id", id)

    if (!error) {
      setVisitors(visitors.filter((v) => v.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Visitor Pipeline</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Track and manage church visitors</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Visitor
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 min-w-[320px] md:min-w-0">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                count={getVisitorsByStatus(column.status).length}
                color={column.color}
              >
                <SortableContext
                  items={getVisitorsByStatus(column.status).map((v) => v.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {getVisitorsByStatus(column.status).map((visitor) => (
                      <VisitorCard
                        key={visitor.id}
                        visitor={visitor}
                        staffMembers={staffMembers}
                        onUpdate={handleUpdateVisitor}
                        onDelete={handleDeleteVisitor}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                </SortableContext>
              </KanbanColumn>
            ))}
          </div>
        </div>
      </DndContext>

      <AddVisitorDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddVisitor}
        staffMembers={staffMembers}
      />
    </div>
  )
}
