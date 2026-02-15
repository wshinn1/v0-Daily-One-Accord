"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, User, MoreVertical, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface KanbanCard {
  id: string
  column_id: string
  title: string
  description: string | null
  assigned_to: { id: string; full_name: string } | null
  position: number
  metadata: Record<string, any>
}

interface StaffMember {
  id: string
  full_name: string
}

interface CustomKanbanCardProps {
  card: KanbanCard
  staffMembers: StaffMember[]
  onUpdate: (id: string, updates: Partial<KanbanCard>) => void
  onDelete: (id: string) => void
}

export function CustomKanbanCard({ card, staffMembers, onUpdate, onDelete }: CustomKanbanCardProps) {
  const { toast } = useToast()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleAssign = async (memberId: string | null) => {
    console.log("[v0] Assigning card to:", memberId)

    onUpdate(card.id, { assigned_to: memberId } as any)

    const assignedMember = staffMembers.find((m) => m.id === memberId)

    toast({
      title: memberId ? "Card assigned" : "Card unassigned",
      description: memberId ? `Assigned to ${assignedMember?.full_name}` : "Assignment removed",
    })

    if (memberId && assignedMember) {
      try {
        // Get the board and column info from the card's metadata
        const boardId = card.metadata?.board_id
        const churchTenantId = card.metadata?.church_tenant_id

        if (boardId && churchTenantId) {
          await fetch("/api/kanban/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "card_assigned",
              cardId: card.id,
              boardId,
              assignedToId: memberId,
            }),
          })
          console.log("[v0] Kanban assignment notification sent")
        }
      } catch (error) {
        console.error("[v0] Failed to send assignment notification:", error)
      }
    }
  }

  return (
    <Card ref={setNodeRef} style={style} className="cursor-move hover:shadow-lg transition-all">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{card.title}</h4>
              {card.assigned_to && (
                <Badge variant="secondary" className="mt-1">
                  <User className="w-3 h-3 mr-1" />
                  {card.assigned_to.full_name}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Assign to</DropdownMenuLabel>
              {staffMembers.map((member) => (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => handleAssign(member.id)}
                  className={card.assigned_to?.id === member.id ? "bg-accent" : ""}
                >
                  {member.full_name}
                  {card.assigned_to?.id === member.id && " ✓"}
                </DropdownMenuItem>
              ))}
              {card.assigned_to && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAssign(null)}>Unassign</DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(card.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {card.description && (
        <CardContent className="p-4 pt-2">
          <p className="text-xs text-muted-foreground line-clamp-3">{card.description}</p>
        </CardContent>
      )}
    </Card>
  )
}
