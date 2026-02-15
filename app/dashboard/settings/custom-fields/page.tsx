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
import { Plus, Pencil, Trash2, ListTree } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomField {
  id: string
  field_name: string
  field_type: string
  is_required: boolean
  field_options: string[] | null
  created_at: string
}

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
]

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [formData, setFormData] = useState({
    field_name: "",
    field_type: "text",
    is_required: false,
    field_options: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadFields()
  }, [])

  const loadFields = async () => {
    try {
      const response = await fetch("/api/custom-fields")
      const data = await response.json()
      if (response.ok) {
        setFields(data.fields || [])
      }
    } catch (error) {
      console.error("[v0] Error loading custom fields:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        field_name: formData.field_name,
        field_type: formData.field_type,
        is_required: formData.is_required,
        field_options: formData.field_type === "select" ? formData.field_options.split(",").map((o) => o.trim()) : null,
      }

      const url = editingField ? `/api/custom-fields/${editingField.id}` : "/api/custom-fields"
      const method = editingField ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: editingField ? "Field updated" : "Field created",
          description: `${formData.field_name} has been ${editingField ? "updated" : "created"} successfully.`,
        })
        setIsDialogOpen(false)
        setEditingField(null)
        setFormData({ field_name: "", field_type: "text", is_required: false, field_options: "" })
        loadFields()
      } else {
        throw new Error("Failed to save field")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save custom field. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (field: CustomField) => {
    setEditingField(field)
    setFormData({
      field_name: field.field_name,
      field_type: field.field_type,
      is_required: field.is_required,
      field_options: field.field_options ? field.field_options.join(", ") : "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom field? All associated data will be lost.")) return

    try {
      const response = await fetch(`/api/custom-fields/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({
          title: "Field deleted",
          description: "The custom field has been removed successfully.",
        })
        loadFields()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete custom field. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = () => {
    setEditingField(null)
    setFormData({ field_name: "", field_type: "text", is_required: false, field_options: "" })
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Fields</h1>
          <p className="text-muted-foreground mt-1">Create custom fields to capture additional visitor information</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          New Field
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Custom Fields</CardTitle>
          <CardDescription>
            Custom fields appear in the visitor detail modal and can be filled out by your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <ListTree className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No custom fields yet</h3>
              <p className="text-muted-foreground mb-4">Create custom fields to track additional visitor information</p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Field
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.field_name}</span>
                      {field.is_required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Type: {fieldTypes.find((t) => t.value === field.field_type)?.label}
                      {field.field_options && ` • Options: ${field.field_options.join(", ")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(field)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(field.id)}
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
            <DialogTitle>{editingField ? "Edit Custom Field" : "Create New Custom Field"}</DialogTitle>
            <DialogDescription>
              {editingField
                ? "Update the field details below"
                : "Add a new custom field to capture visitor information"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="field_name">Field Name</Label>
                <Input
                  id="field_name"
                  placeholder="e.g., Preferred Service Time, How They Heard About Us"
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_type">Field Type</Label>
                <Select
                  value={formData.field_type}
                  onValueChange={(value) => setFormData({ ...formData, field_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.field_type === "select" && (
                <div className="space-y-2">
                  <Label htmlFor="field_options">Dropdown Options</Label>
                  <Input
                    id="field_options"
                    placeholder="Option 1, Option 2, Option 3"
                    value={formData.field_options}
                    onChange={(e) => setFormData({ ...formData, field_options: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Separate options with commas</p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked as boolean })}
                />
                <Label htmlFor="is_required" className="text-sm font-normal cursor-pointer">
                  Make this field required
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingField ? "Update Field" : "Create Field"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
