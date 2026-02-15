"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface KanbanColumn {
  id: string
  name: string
  color: string
  position: number
}

interface ManageColumnsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  columns: KanbanColumn[]
  onUpdate: (columns: KanbanColumn[]) => void
}

const colorOptions = [
  { value: "blue", label: "Blue" },
  { value: "emerald", label: "Green" },
  { value: "amber", label: "Yellow" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
]

export function ManageColumnsDialog({ open, onOpenChange, boardId, columns, onUpdate }: ManageColumnsDialogProps) {
  const [localColumns, setLocalColumns] = useState(columns)
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnColor, setNewColumnColor] = useState("blue")
  const supabase = getSupabaseBrowserClient()

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return

    const { data, error } = await supabase
      .from("kanban_columns")
      .insert({
        board_id: boardId,
        name: newColumnName,
        color: newColumnColor,
        position: localColumns.length,
      })
      .select()
      .single()

    if (!error && data) {
      const updated = [...localColumns, data]
      setLocalColumns(updated)
      onUpdate(updated)
      setNewColumnName("")
      setNewColumnColor("blue")
    }
  }

  const handleDeleteColumn = async (columnId: string) => {
    const { error } = await supabase.from("kanban_columns").delete().eq("id", columnId)

    if (!error) {
      const updated = localColumns.filter((c) => c.id !== columnId)
      setLocalColumns(updated)
      onUpdate(updated)
    }
  }

  const handleUpdateColumn = async (columnId: string, updates: Partial<KanbanColumn>) => {
    const { error } = await supabase.from("kanban_columns").update(updates).eq("id", columnId)

    if (!error) {
      const updated = localColumns.map((c) => (c.id === columnId ? { ...c, ...updates } : c))
      setLocalColumns(updated)
      onUpdate(updated)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Existing Columns</Label>
            <div className="space-y-2">
              {localColumns.map((column) => (
                <div key={column.id} className="flex items-center gap-2 p-3 border rounded-lg">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={column.name}
                    onChange={(e) => handleUpdateColumn(column.id, { name: e.target.value })}
                    className="flex-1"
                  />
                  <Select
                    value={column.color}
                    onValueChange={(value) => handleUpdateColumn(column.id, { color: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteColumn(column.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Add New Column</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="flex-1"
              />
              <Select value={newColumnColor} onValueChange={setNewColumnColor}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddColumn}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
