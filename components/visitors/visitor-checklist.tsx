"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface ChecklistItem {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  completed_at: string | null
  completed_by_user: {
    id: string
    full_name: string
  } | null
  position: number
}

interface VisitorChecklistProps {
  visitorId: string
  currentUserId: string
}

export function VisitorChecklist({ visitorId, currentUserId }: VisitorChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newItemTitle, setNewItemTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadItems()
  }, [visitorId])

  const loadItems = async () => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/checklist`)
      const data = await response.json()

      if (response.ok) {
        setItems(data.items || [])
      }
    } catch (error) {
      console.error("[v0] Error loading checklist items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return

    setIsAdding(true)

    try {
      const response = await fetch(`/api/visitors/${visitorId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newItemTitle,
          position: items.length,
        }),
      })

      if (!response.ok) throw new Error("Failed to add item")

      const data = await response.json()
      setItems([...items, data.item])
      setNewItemTitle("")
      toast({ title: "Success", description: "Checklist item added" })
    } catch (error) {
      console.error("[v0] Error adding item:", error)
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" })
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleItem = async (item: ChecklistItem) => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/checklist/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_completed: !item.is_completed,
        }),
      })

      if (!response.ok) throw new Error("Failed to update item")

      const data = await response.json()
      setItems(items.map((i) => (i.id === item.id ? data.item : i)))
    } catch (error) {
      console.error("[v0] Error toggling item:", error)
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/checklist/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete item")

      setItems(items.filter((i) => i.id !== itemId))
      toast({ title: "Success", description: "Checklist item deleted" })
    } catch (error) {
      console.error("[v0] Error deleting item:", error)
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" })
    }
  }

  const completedCount = items.filter((i) => i.is_completed).length
  const totalCount = items.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading checklist...</div>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Progress: {completedCount} of {totalCount} completed
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No checklist items yet. Add tasks to track visitor onboarding progress.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg group hover:bg-accent/50">
              <GripVertical className="w-4 h-4 text-muted-foreground mt-1 cursor-move" />
              <Checkbox checked={item.is_completed} onCheckedChange={() => handleToggleItem(item)} className="mt-1" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.is_completed ? "line-through text-muted-foreground" : ""}`}>
                  {item.title}
                </p>
                {item.is_completed && item.completed_by_user && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed by {item.completed_by_user.full_name}
                    {item.completed_at && ` on ${new Date(item.completed_at).toLocaleDateString()}`}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Add a checklist item..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddItem()
            }
          }}
          disabled={isAdding}
        />
        <Button onClick={handleAddItem} disabled={isAdding || !newItemTitle.trim()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  )
}
