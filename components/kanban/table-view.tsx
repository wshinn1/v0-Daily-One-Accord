"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, AlertCircle, User, MoreVertical, Trash2, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

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
  due_date?: string | null
  priority?: string | null
  labels?: string[] | null
  metadata: any
}

interface StaffMember {
  id: string
  full_name: string
}

interface TableViewProps {
  columns: Column[]
  staffMembers: StaffMember[]
  onUpdateCard: (id: string, updates: Partial<Card>) => void
  onDeleteCard: (id: string) => void
  onCardClick: (cardId: string) => void
}

export function TableView({ columns, staffMembers, onUpdateCard, onDeleteCard, onCardClick }: TableViewProps) {
  const [editingCell, setEditingCell] = useState<{ cardId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const allCards = columns.flatMap((col) =>
    (col.kanban_cards || []).map((card) => ({
      ...card,
      columnName: col.name,
      columnColor: col.color,
    })),
  )

  const priorityColors = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  }

  const getColumnColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-100 text-green-700 border-green-200",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
      red: "bg-red-100 text-red-700 border-red-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      pink: "bg-pink-100 text-pink-700 border-pink-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
    }
    return colorMap[color] || colorMap.gray
  }

  const startEditing = (cardId: string, field: string, currentValue: string) => {
    setEditingCell({ cardId, field })
    setEditValue(currentValue || "")
  }

  const saveEdit = (cardId: string, field: string) => {
    if (editValue.trim() !== "") {
      onUpdateCard(cardId, { [field]: editValue.trim() })
    }
    setEditingCell(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Assigned To</TableHead>
            <TableHead className="font-semibold">Due Date</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Labels</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allCards.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                No cards found. Create your first card to get started.
              </TableCell>
            </TableRow>
          ) : (
            allCards.map((card) => {
              const assignedMember = staffMembers.find((m) => m.id === card.assigned_to)
              const isEditingTitle = editingCell?.cardId === card.id && editingCell?.field === "title"
              const isEditingDescription = editingCell?.cardId === card.id && editingCell?.field === "description"

              return (
                <TableRow key={card.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium max-w-[250px]">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(card.id, "title")
                            if (e.key === "Escape") cancelEdit()
                          }}
                          className="h-8"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => saveEdit(card.id, "title")}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="line-clamp-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditing(card.id, "title", card.title)
                        }}
                      >
                        {card.title}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="max-w-[300px]">
                    {isEditingDescription ? (
                      <div className="flex items-start gap-2" onClick={(e) => e.stopPropagation()}>
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) saveEdit(card.id, "description")
                            if (e.key === "Escape") cancelEdit()
                          }}
                          className="min-h-[60px] text-sm"
                          autoFocus
                        />
                        <div className="flex flex-col gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => saveEdit(card.id, "description")}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-muted-foreground line-clamp-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditing(card.id, "description", card.description || "")
                        }}
                      >
                        {card.description || <span className="italic">Click to add description</span>}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={`${getColumnColor(card.columnColor)}`}>
                      {card.columnName}
                    </Badge>
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={card.assigned_to || "unassigned"}
                      onValueChange={(value) =>
                        onUpdateCard(card.id, { assigned_to: value === "unassigned" ? null : value })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs border-border/50 hover:border-border transition-colors w-[150px]">
                        <SelectValue>
                          {assignedMember ? (
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <span className="font-medium truncate">{assignedMember.full_name}</span>
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
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 px-2 hover:bg-muted/50">
                          {card.due_date ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {new Date(card.due_date).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              Set date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={card.due_date ? new Date(card.due_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              onUpdateCard(card.id, { due_date: format(date, "yyyy-MM-dd") })
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={card.priority || "none"}
                      onValueChange={(value) => onUpdateCard(card.id, { priority: value === "none" ? null : value })}
                    >
                      <SelectTrigger className="h-8 text-xs border-border/50 hover:border-border transition-colors w-[120px]">
                        <SelectValue>
                          {card.priority ? (
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="h-3 w-3" />
                              <span className="capitalize">{card.priority}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Set priority</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell onClick={() => onCardClick(card.id)}>
                    {card.labels && card.labels.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {card.labels.slice(0, 2).map((label, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                        {card.labels.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{card.labels.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDeleteCard(card.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
