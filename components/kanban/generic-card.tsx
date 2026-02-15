"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical, User, Trash2, Calendar, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface GenericCardProps {
  card: {
    id: string
    title: string
    description: string | null
    assigned_to: string | null
    due_date?: string | null
    priority?: string | null
    labels?: string[] | null
    metadata?: any
  }
  staffMembers: { id: string; full_name: string }[]
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
  onClick?: () => void
}

export function GenericCard({ card, staffMembers, onUpdate, onDelete, onClick }: GenericCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const assignedMember = staffMembers.find((m) => m.id === card.assigned_to)

  const priorityColors = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-border/50 bg-card/95 backdrop-blur-sm"
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (!target.closest("button") && !target.closest('[role="combobox"]')) {
            onClick?.()
          }
        }}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{card.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 -mt-1 hover:bg-muted/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDelete(card.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {card.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{card.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {card.due_date && (
              <Badge variant="outline" className="text-xs gap-1 px-2 py-0.5">
                <Calendar className="h-3 w-3" />
                {new Date(card.due_date).toLocaleDateString()}
              </Badge>
            )}

            {card.priority && (
              <Badge
                variant="outline"
                className={`text-xs gap-1 px-2 py-0.5 ${priorityColors[card.priority as keyof typeof priorityColors] || ""}`}
              >
                <AlertCircle className="h-3 w-3" />
                {card.priority}
              </Badge>
            )}

            {card.labels && card.labels.length > 0 && (
              <div className="flex gap-1">
                {card.labels.slice(0, 2).map((label, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                    {label}
                  </Badge>
                ))}
                {card.labels.length > 2 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{card.labels.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t" onClick={(e) => e.stopPropagation()}>
            <Select
              value={card.assigned_to || "unassigned"}
              onValueChange={(value) => onUpdate(card.id, { assigned_to: value === "unassigned" ? null : value })}
            >
              <SelectTrigger className="h-8 text-xs border-border/50 hover:border-border transition-colors">
                <SelectValue>
                  {assignedMember ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="font-medium">{assignedMember.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      Unassigned
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {staffMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
