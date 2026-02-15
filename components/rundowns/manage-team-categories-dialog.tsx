"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Card } from "@/components/ui/card"

interface TeamCategory {
  id: string
  name: string
  description: string | null
  order_index: number
}

interface ManageTeamCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  churchTenantId: string
}

export function ManageTeamCategoriesDialog({ open, onOpenChange, churchTenantId }: ManageTeamCategoriesDialogProps) {
  const [categories, setCategories] = useState<TeamCategory[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("service_team_categories")
      .select("*")
      .eq("church_tenant_id", churchTenantId)
      .eq("is_active", true)
      .order("order_index")

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load team categories",
        variant: "destructive",
      })
      return
    }

    setCategories(data || [])
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    setLoading(true)
    try {
      const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order_index)) : 0

      const { data, error } = await supabase
        .from("service_team_categories")
        .insert({
          church_tenant_id: churchTenantId,
          name: newCategoryName,
          description: newCategoryDescription || null,
          order_index: maxOrder + 1,
        })
        .select()
        .single()

      if (error) throw error

      setCategories([...categories, data])
      setNewCategoryName("")
      setNewCategoryDescription("")

      toast({
        title: "Category added",
        description: "Team category has been added successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase.from("service_team_categories").update({ is_active: false }).eq("id", categoryId)

      if (error) throw error

      setCategories(categories.filter((c) => c.id !== categoryId))

      toast({
        title: "Category removed",
        description: "Team category has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Service Team Categories</DialogTitle>
          <DialogDescription>Add or remove team categories for your church services</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Existing Categories */}
          <div className="space-y-2">
            <Label>Current Categories</Label>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet. Add one below.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <Card key={category.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add New Category */}
          <div className="space-y-3 pt-4 border-t">
            <Label>Add New Category</Label>
            <div className="space-y-2">
              <Input
                placeholder="Category name (e.g., Ushers Team)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={2}
              />
              <Button onClick={handleAddCategory} disabled={loading || !newCategoryName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
