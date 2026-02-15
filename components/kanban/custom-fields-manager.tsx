"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface CustomField {
  id: string
  field_name: string
  field_type: string
  field_options: any
  is_required: boolean
  display_order: number
}

interface CustomFieldsManagerProps {
  boardId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomFieldsManager({ boardId, open, onOpenChange }: CustomFieldsManagerProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newField, setNewField] = useState({
    field_name: "",
    field_type: "text",
    field_options: {},
    is_required: false,
  })

  useEffect(() => {
    if (open) {
      fetchFields()
    }
  }, [open, boardId])

  const fetchFields = async () => {
    try {
      console.log("[v0] Fetching custom fields for board:", boardId)
      const response = await fetch(`/api/kanban/boards/${boardId}/custom-fields`)
      const data = await response.json()
      setFields(data)
      console.log("[v0] Custom fields loaded:", data.length)
    } catch (error) {
      console.error("[v0] Error fetching custom fields:", error)
    }
  }

  const handleAddField = async () => {
    if (!newField.field_name.trim()) {
      alert("Please enter a field name")
      return
    }

    try {
      setIsLoading(true)
      console.log("[v0] Creating custom field:", newField)

      const response = await fetch(`/api/kanban/boards/${boardId}/custom-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newField,
          display_order: fields.length,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFields([...fields, data])
        setNewField({
          field_name: "",
          field_type: "text",
          field_options: {},
          is_required: false,
        })
        console.log("[v0] Custom field created successfully")
      } else {
        const error = await response.json()
        alert("Failed to create field: " + error.error)
      }
    } catch (error) {
      console.error("[v0] Error creating custom field:", error)
      alert("An error occurred while creating the field")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this field? All data for this field will be lost.")) {
      return
    }

    try {
      console.log("[v0] Deleting custom field:", fieldId)
      const response = await fetch(`/api/kanban/boards/${boardId}/custom-fields/${fieldId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFields(fields.filter((f) => f.id !== fieldId))
        console.log("[v0] Custom field deleted successfully")
      } else {
        alert("Failed to delete field")
      }
    } catch (error) {
      console.error("[v0] Error deleting custom field:", error)
      alert("An error occurred while deleting the field")
    }
  }

  const fieldTypeOptions = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "select", label: "Select (Dropdown)" },
    { value: "multiselect", label: "Multi-Select" },
    { value: "checkbox", label: "Checkbox" },
    { value: "url", label: "URL" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Custom Fields</DialogTitle>
          <DialogDescription>Add custom fields to capture additional information on your cards</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Fields */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Current Fields</Label>
            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
                No custom fields yet. Add one below to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{field.field_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Type: {field.field_type}
                        {field.is_required && " • Required"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteField(field.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Field */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-sm font-semibold">Add New Field</Label>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Field Name</Label>
                <Input
                  id="field-name"
                  placeholder="e.g., Progress, Status, Budget"
                  value={newField.field_name}
                  onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-type">Field Type</Label>
                <Select
                  value={newField.field_type}
                  onValueChange={(value) => setNewField({ ...newField, field_type: value })}
                >
                  <SelectTrigger id="field-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(newField.field_type === "select" || newField.field_type === "multiselect") && (
                <div className="space-y-2">
                  <Label htmlFor="field-options">Options (comma-separated)</Label>
                  <Textarea
                    id="field-options"
                    placeholder="Option 1, Option 2, Option 3"
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        field_options: { options: e.target.value.split(",").map((o) => o.trim()) },
                      })
                    }
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={newField.is_required}
                  onCheckedChange={(checked) => setNewField({ ...newField, is_required: checked })}
                />
                <Label htmlFor="required" className="cursor-pointer">
                  Required field
                </Label>
              </div>

              <Button onClick={handleAddField} disabled={isLoading} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
