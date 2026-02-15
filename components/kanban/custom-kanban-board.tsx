"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { KanbanColumnComponent } from "@/components/visitors/kanban-column"
import { CustomKanbanCard } from "./custom-kanban-card"
import { AddCardDialog } from "./add-card-dialog"
import { ManageColumnsDialog } from "./manage-columns-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface KanbanCard {
  id: string
  column_id: string
  title: string
  description: string | null
  assigned_to: { id: string; full_name: string } | null
  position: number
  metadata: Record<string, any>
}

interface KanbanColumn {
  id: string
  name: string
  color: string
  position: number
}

interface StaffMember {
  id: string
  full_name: string
}

interface CustomKanbanBoardProps {
  boardId: string
  boardName: string
  initialColumns: KanbanColumn[]
  initialCards: KanbanCard[]
  staffMembers: StaffMember[]
  churchTenantId: string
}

export function CustomKanbanBoard({
  boardId,
  boardName,
  initialColumns,
  initialCards,
  staffMembers,
  churchTenantId,
}: CustomKanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns)
  const [cards, setCards] = useState(initialCards)
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string>("")
  const supabase = getSupabaseBrowserClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const getCardsByColumn = (columnId: string) => {
    return cards.filter((c) => c.column_id === columnId).sort((a, b) => a.position - b.position)
  }

  const sendSlackNotification = async (eventType: string, cardId: string, extraData?: any) => {
    try {
      await fetch("/api/kanban/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          cardId,
          boardId,
          ...extraData,
        }),
      })
    } catch (error) {
      console.error("[v0] Failed to send Slack notification:", error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id)
    setActiveCard(card || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeCard = cards.find((c) => c.id === active.id)
    if (!activeCard) return

    const newColumnId = over.id as string

    if (activeCard.column_id !== newColumnId) {
      const previousColumnId = activeCard.column_id
      const updatedCards = cards.map((c) => (c.id === activeCard.id ? { ...c, column_id: newColumnId } : c))
      setCards(updatedCards)

      await supabase.from("kanban_cards").update({ column_id: newColumnId }).eq("id", activeCard.id)

      await sendSlackNotification("card_moved", activeCard.id, {
        previousColumnId,
        newColumnId,
      })
    }
  }

  const handleAddCard = async (cardData: any) => {
    const { data, error } = await supabase
      .from("kanban_cards")
      .insert({
        ...cardData,
        column_id: selectedColumnId,
        position: getCardsByColumn(selectedColumnId).length,
      })
      .select("*, assigned_to:users(id, full_name)")
      .single()

    if (!error && data) {
      setCards([...cards, data])

      await sendSlackNotification("card_created", data.id)
    }
  }

  const handleUpdateCard = async (id: string, updates: Partial<KanbanCard>) => {
    const { error } = await supabase.from("kanban_cards").update(updates).eq("id", id)

    if (!error) {
      setCards(cards.map((c) => (c.id === id ? { ...c, ...updates } : c)))

      if (updates.assigned_to) {
        await sendSlackNotification("card_assigned", id, {
          assignedToId: updates.assigned_to,
        })
      }
    }
  }

  const handleDeleteCard = async (id: string) => {
    const { error } = await supabase.from("kanban_cards").delete().eq("id", id)

    if (!error) {
      setCards(cards.filter((c) => c.id !== id))
    }
  }

  const handleColumnsUpdate = (updatedColumns: KanbanColumn[]) => {
    setColumns(updatedColumns)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{boardName}</h2>
          <p className="text-muted-foreground">Manage your workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsManageColumnsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Columns
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(300px, 1fr))` }}>
          {columns.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              id={column.id}
              title={column.name}
              count={getCardsByColumn(column.id).length}
              color={column.color as any}
              actions={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedColumnId(column.id)
                    setIsAddDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              }
            >
              <SortableContext
                items={getCardsByColumn(column.id).map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {getCardsByColumn(column.id).map((card) => (
                    <CustomKanbanCard
                      key={card.id}
                      card={card}
                      staffMembers={staffMembers}
                      onUpdate={handleUpdateCard}
                      onDelete={handleDeleteCard}
                    />
                  ))}
                </div>
              </SortableContext>
            </KanbanColumnComponent>
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="opacity-80 rotate-3 scale-105">
              <CustomKanbanCard card={activeCard} staffMembers={staffMembers} onUpdate={() => {}} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddCardDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddCard}
        staffMembers={staffMembers}
      />

      <ManageColumnsDialog
        open={isManageColumnsOpen}
        onOpenChange={setIsManageColumnsOpen}
        boardId={boardId}
        columns={columns}
        onUpdate={handleColumnsUpdate}
      />
    </div>
  )
}
