"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Plus, Settings, Pencil, Check, X, LayoutGrid, TableIcon } from "lucide-react"
import { GenericKanbanColumn } from "./generic-kanban-column"
import { GenericCard } from "./generic-card"
import { AddCardDialog } from "./add-card-dialog"
import { ColumnSettingsDialog } from "./column-settings-dialog"
import { CardDetailModal } from "./card-detail-modal"
import { TableView } from "./table-view"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Column {
  id: string
  name: string
  color: string
  position: number
  kanban_cards: Card[]
}

interface Card {
  id: string
  title: string
  description: string | null
  column_id: string
  position: number
  assigned_to: string | null
  metadata: any
}

interface Board {
  id: string
  name: string
  description: string | null
  board_type: string
  kanban_columns: Column[]
}

interface StaffMember {
  id: string
  full_name: string
}

interface GenericKanbanProps {
  board: Board
  staffMembers: StaffMember[]
  churchTenantId: string
  currentUserId: string
  currentUserRole: string
}

export function GenericKanban({
  board,
  staffMembers,
  churchTenantId,
  currentUserId,
  currentUserRole,
}: GenericKanbanProps) {
  console.log("[v0] GenericKanban rendering with board:", board?.name)
  console.log("[v0] GenericKanban columns:", board?.kanban_columns?.length || 0)

  const initialColumns = Array.isArray(board?.kanban_columns)
    ? board.kanban_columns.sort((a, b) => (a?.position || 0) - (b?.position || 0))
    : []

  console.log("[v0] Initial columns:", initialColumns.length)

  const [columns, setColumns] = useState(initialColumns)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isEditingBoardName, setIsEditingBoardName] = useState(false)
  const [boardName, setBoardName] = useState(board?.name || "Untitled Board")
  const [tempBoardName, setTempBoardName] = useState(boardName)
  const [currentView, setCurrentView] = useState<"kanban" | "table">("kanban")
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    console.log("[v0] Columns state updated:", columns.length)
  }, [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const getCardsByColumn = (columnId: string) => {
    const column = columns.find((c) => c?.id === columnId)
    return column?.kanban_cards?.sort((a, b) => (a?.position || 0) - (b?.position || 0)) || []
  }

  const handleDragStart = (event: DragStartEvent) => {
    try {
      const card = columns.flatMap((c) => c?.kanban_cards || []).find((card) => card?.id === event.active.id)
      setActiveCard(card || null)
    } catch (error) {
      console.error("[v0] Error in handleDragStart:", error)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    try {
      console.log("[v0] Drag end event:", { active: event.active.id, over: event.over?.id })
      const { active, over } = event
      setActiveCard(null)

      if (!over) {
        console.log("[v0] No drop target")
        return
      }

      const activeCard = columns.flatMap((c) => c?.kanban_cards || []).find((card) => card?.id === active.id)
      if (!activeCard) {
        console.error("[v0] Active card not found:", active.id)
        return
      }

      const overColumnId = over.data.current?.sortable?.containerId || over.id
      const newColumnId = overColumnId as string

      console.log("[v0] Moving card from", activeCard.column_id, "to", newColumnId)

      if (activeCard.column_id !== newColumnId) {
        // Update locally
        const updatedColumns = columns.map((col) => ({
          ...col,
          kanban_cards:
            col.id === newColumnId
              ? [...(col.kanban_cards || []), { ...activeCard, column_id: newColumnId }]
              : (col.kanban_cards || []).filter((c) => c?.id !== activeCard.id),
        }))
        setColumns(updatedColumns)

        // Update in database
        const { error } = await supabase.from("kanban_cards").update({ column_id: newColumnId }).eq("id", activeCard.id)

        if (error) {
          console.error("[v0] Error updating card column:", error)
          // Revert on error
          setColumns(columns)
        } else {
          console.log("[v0] Card moved successfully")

          // Log activity
          await fetch(`/api/kanban/cards/${activeCard.id}/activities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activity_type: "moved",
              activity_data: {
                old_column: activeCard.column_id,
                new_column: newColumnId,
              },
            }),
          }).catch((err) => console.error("[v0] Error logging activity:", err))

          // Send Slack notification
          await fetch("/api/kanban/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "card_moved",
              cardId: activeCard.id,
              boardId: board.id,
              previousColumnId: activeCard.column_id,
              newColumnId,
            }),
          }).catch((err) => console.error("[v0] Error sending Slack notification:", err))
        }
      }
    } catch (error) {
      console.error("[v0] Error in handleDragEnd:", error)
    }
  }

  const handleAddCard = async (cardData: any) => {
    try {
      console.log("[v0] Adding new card:", cardData)
      const firstColumn = columns[0]
      if (!firstColumn) {
        console.error("[v0] No columns available to add card")
        alert("Please add columns first before creating cards")
        return
      }

      const { data, error } = await supabase
        .from("kanban_cards")
        .insert({
          ...cardData,
          column_id: firstColumn.id,
          position: (firstColumn.kanban_cards || []).length,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error adding card:", error)
        alert("Failed to create card: " + error.message)
        return
      }

      if (data) {
        console.log("[v0] Card created successfully:", data.id)
        setColumns(
          columns.map((col) =>
            col.id === firstColumn.id ? { ...col, kanban_cards: [...(col.kanban_cards || []), data] } : col,
          ),
        )

        // Log activity
        await fetch(`/api/kanban/cards/${data.id}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_type: "created",
            activity_data: {},
          }),
        }).catch((err) => console.error("[v0] Error logging activity:", err))

        // Send Slack notification
        await fetch("/api/kanban/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "card_created",
            cardId: data.id,
            boardId: board.id,
          }),
        }).catch((err) => console.error("[v0] Error sending Slack notification:", err))
      }
    } catch (error) {
      console.error("[v0] Error in handleAddCard:", error)
      alert("An unexpected error occurred while creating the card")
    }
  }

  const handleUpdateCard = async (id: string, updates: Partial<Card>) => {
    try {
      const { error } = await supabase.from("kanban_cards").update(updates).eq("id", id)

      if (!error) {
        setColumns(
          columns.map((col) => ({
            ...col,
            kanban_cards: (col.kanban_cards || []).map((card) => (card?.id === id ? { ...card, ...updates } : card)),
          })),
        )
      }
    } catch (error) {
      console.error("[v0] Error in handleUpdateCard:", error)
    }
  }

  const handleDeleteCard = async (id: string) => {
    try {
      const { error } = await supabase.from("kanban_cards").delete().eq("id", id)

      if (!error) {
        setColumns(
          columns.map((col) => ({
            ...col,
            kanban_cards: (col.kanban_cards || []).filter((card) => card?.id !== id),
          })),
        )
      }
    } catch (error) {
      console.error("[v0] Error in handleDeleteCard:", error)
    }
  }

  const handleColumnsUpdate = (updatedColumns: Column[]) => {
    console.log("[v0] Columns updated:", updatedColumns.length)
    setColumns(updatedColumns)
  }

  const handleCardClick = (cardId: string) => {
    console.log("[v0] Opening card detail modal for:", cardId)
    setSelectedCardId(cardId)
    setIsCardModalOpen(true)
  }

  const handleCardModalClose = () => {
    console.log("[v0] Closing card detail modal")
    setIsCardModalOpen(false)
    setSelectedCardId(null)
  }

  const handleCardUpdate = () => {
    console.log("[v0] Card updated, refreshing board")
    // Refresh the board data
    window.location.reload()
  }

  const handleUpdateBoardName = async () => {
    if (!tempBoardName.trim() || tempBoardName === boardName) {
      setIsEditingBoardName(false)
      setTempBoardName(boardName)
      return
    }

    try {
      const { error } = await supabase.from("kanban_boards").update({ name: tempBoardName.trim() }).eq("id", board.id)

      if (error) {
        console.error("[v0] Error updating board name:", error)
        alert("Failed to update board name")
        setTempBoardName(boardName)
      } else {
        setBoardName(tempBoardName.trim())
        console.log("[v0] Board name updated successfully")
      }
    } catch (error) {
      console.error("[v0] Error in handleUpdateBoardName:", error)
      setTempBoardName(boardName)
    } finally {
      setIsEditingBoardName(false)
    }
  }

  const handleCancelEdit = () => {
    setTempBoardName(boardName)
    setIsEditingBoardName(false)
  }

  const isAdmin = ["lead_admin", "admin"].includes(currentUserRole)

  if (!board) {
    console.error("[v0] Board is null/undefined")
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error: Board data is missing</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="space-y-1 flex-1">
          {isEditingBoardName ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempBoardName}
                onChange={(e) => setTempBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateBoardName()
                  if (e.key === "Escape") handleCancelEdit()
                }}
                className="text-3xl font-bold h-12 max-w-md"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleUpdateBoardName}>
                <Check className="w-5 h-5 text-green-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                <X className="w-5 h-5 text-red-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {boardName}
              </h2>
              {isAdmin && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditingBoardName(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
          {board.description && <p className="text-sm text-muted-foreground max-w-2xl">{board.description}</p>}
        </div>
        <div className="flex gap-2 items-center">
          <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as "kanban" | "table")}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="kanban" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <TableIcon className="w-4 h-4" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {isAdmin && (
            <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="shadow-sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage Columns
            </Button>
          )}
          <Button onClick={() => setIsAddDialogOpen(true)} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      {columns.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No columns yet. Add columns to get started.</p>
          {isAdmin && (
            <Button onClick={() => setIsSettingsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Columns
            </Button>
          )}
        </div>
      ) : (
        <>
          {currentView === "kanban" ? (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {columns.map((column) => {
                  if (!column || !column.id) {
                    console.error("[v0] Invalid column:", column)
                    return null
                  }

                  return (
                    <GenericKanbanColumn
                      key={column.id}
                      id={column.id}
                      title={column.name || "Untitled"}
                      count={getCardsByColumn(column.id).length}
                      color={column.color}
                    >
                      <SortableContext
                        items={getCardsByColumn(column.id).map((c) => c?.id || "")}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {getCardsByColumn(column.id).map((card) => {
                            if (!card || !card.id) {
                              console.error("[v0] Invalid card:", card)
                              return null
                            }

                            return (
                              <GenericCard
                                key={card.id}
                                card={card}
                                staffMembers={staffMembers || []}
                                onUpdate={handleUpdateCard}
                                onDelete={handleDeleteCard}
                                onClick={() => handleCardClick(card.id)}
                              />
                            )
                          })}
                        </div>
                      </SortableContext>
                    </GenericKanbanColumn>
                  )
                })}
              </div>

              <DragOverlay>
                {activeCard ? (
                  <div className="opacity-90 rotate-2 scale-105 shadow-2xl">
                    <GenericCard
                      card={activeCard}
                      staffMembers={staffMembers || []}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <TableView
              columns={columns}
              staffMembers={staffMembers}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onCardClick={handleCardClick}
            />
          )}
        </>
      )}

      <AddCardDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddCard}
        staffMembers={staffMembers || []}
      />

      <ColumnSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        boardId={board.id}
        columns={columns}
        onColumnsUpdate={handleColumnsUpdate}
      />

      {selectedCardId && (
        <CardDetailModal
          cardId={selectedCardId}
          isOpen={isCardModalOpen}
          onClose={handleCardModalClose}
          onUpdate={handleCardUpdate}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}
