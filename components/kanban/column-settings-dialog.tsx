"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Column {
  id: string
  name: string
  color: string
  position: number
}

interface ColumnSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  columns: Column[]
  onColumnsUpdate: (columns: Column[]) => void
}

const COLORS = [
  { name: "Gray", value: "gray" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Yellow", value: "amber" },
  { name: "Red", value: "red" },
  { name: "Purple", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Teal", value: "emerald" },
]

export function ColumnSettingsDialog({
  open,
  onOpenChange,
  boardId,
  columns,
  onColumnsUpdate,
}: ColumnSettingsDialogProps) {
  const [localColumns, setLocalColumns] = useState(columns)
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnColor, setNewColumnColor] = useState("gray")
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    setLocalColumns(columns)
  }, [columns])

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
      const updatedColumns = [...localColumns, { ...data, kanban_cards: [] }]
      setLocalColumns(updatedColumns)
      onColumnsUpdate(updatedColumns)
      setNewColumnName("")
      setNewColumnColor("gray")
    }
  }

  const handleDeleteColumn = async (columnId: string) => {
    const { error } = await supabase.from("kanban_columns").delete().eq("id", columnId)

    if (!error) {
      const updatedColumns = localColumns.filter((c) => c.id !== columnId)
      setLocalColumns(updatedColumns)
      onColumnsUpdate(updatedColumns)
    }
  }

  const handleUpdateColumn = async (columnId: string, updates: Partial<Column>) => {
    const { error } = await supabase.from("kanban_columns").update(updates).eq("id", columnId)

    if (!error) {
      const updatedColumns = localColumns.map((c) => (c.id === columnId ? { ...c, ...updates } : c))
      setLocalColumns(updatedColumns)
      onColumnsUpdate(updatedColumns)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Existing Columns</h4>
            {localColumns.map((column) => (
              <div key={column.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={column.name}
                  onChange={(e) => handleUpdateColumn(column.id, { name: e.target.value })}
                  className="flex-1"
                />
                <select
                  value={column.color}
                  onChange={(e) => handleUpdateColumn(column.id, { color: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  {COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteColumn(column.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Add New Column</h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="column-name">Column Name</Label>
                <Input
                  id="column-name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g., In Progress"
                />
              </div>
              <div>
                <Label htmlFor="column-color">Color</Label>
                <select
                  id="column-color"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                  className="px-3 py-2 border rounded-md h-10"
                >
                  {COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
