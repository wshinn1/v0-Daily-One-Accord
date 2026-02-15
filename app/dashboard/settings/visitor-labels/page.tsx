"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VisitorLabel {
  id: string
  name: string
  color: string
  created_at: string
}

const colorOptions = [
  { value: "red", label: "Red", class: "bg-red-100 text-red-800" },
  { value: "orange", label: "Orange", class: "bg-orange-100 text-orange-800" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-100 text-yellow-800" },
  { value: "green", label: "Green", class: "bg-green-100 text-green-800" },
  { value: "blue", label: "Blue", class: "bg-blue-100 text-blue-800" },
  { value: "purple", label: "Purple", class: "bg-purple-100 text-purple-800" },
  { value: "pink", label: "Pink", class: "bg-pink-100 text-pink-800" },
  { value: "gray", label: "Gray", class: "bg-gray-100 text-gray-800" },
]

export default function VisitorLabelsPage() {
  const [labels, setLabels] = useState<VisitorLabel[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<VisitorLabel | null>(null)
  const [formData, setFormData] = useState({ name: "", color: "blue" })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadLabels()
  }, [])

  const loadLabels = async () => {
    try {
      const response = await fetch("/api/labels")
      const data = await response.json()
      if (response.ok) {
        setLabels(data.labels || [])
      }
    } catch (error) {
      console.error("[v0] Error loading labels:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingLabel ? `/api/labels/${editingLabel.id}` : "/api/labels"
      const method = editingLabel ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: editingLabel ? "Label updated" : "Label created",
          description: `${formData.name} has been ${editingLabel ? "updated" : "created"} successfully.`,
        })
        setIsDialogOpen(false)
        setEditingLabel(null)
        setFormData({ name: "", color: "blue" })
        loadLabels()
      } else {
        throw new Error("Failed to save label")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save label. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (label: VisitorLabel) => {
    setEditingLabel(label)
    setFormData({ name: label.name, color: label.color })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this label?")) return

    try {
      const response = await fetch(`/api/labels/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({
          title: "Label deleted",
          description: "The label has been removed successfully.",
        })
        loadLabels()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete label. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = () => {
    setEditingLabel(null)
    setFormData({ name: "", color: "blue" })
    setIsDialogOpen(true)
  }

  const getColorClass = (color: string) => {
    return colorOptions.find((c) => c.value === color)?.class || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Visitor Labels</h1>
          <p className="text-muted-foreground mt-1">Create and manage labels to organize your visitors</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          New Label
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Labels</CardTitle>
          <CardDescription>Labels help you categorize and filter visitors on the kanban board</CardDescription>
        </CardHeader>
        <CardContent>
          {labels.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No labels yet</h3>
              <p className="text-muted-foreground mb-4">Create your first label to start organizing visitors</p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Label
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getColorClass(label.color)}>{label.name}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(label)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(label.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLabel ? "Edit Label" : "Create New Label"}</DialogTitle>
            <DialogDescription>
              {editingLabel ? "Update the label details below" : "Add a new label to organize your visitors"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Label Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., VIP, Needs Prayer, First Time"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={color.class}>{color.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <Label>Preview</Label>
                <div className="mt-2">
                  <Badge className={getColorClass(formData.color)}>{formData.name || "Label Preview"}</Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingLabel ? "Update Label" : "Create Label"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
