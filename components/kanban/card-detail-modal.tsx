"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CardComments } from "./card-comments"
import { CardActivityFeed } from "./card-activity-feed"
import { CardReminders } from "./card-reminders"
import { formatDate } from "@/lib/utils/date-helpers"
import { CalendarIcon, User, Tag, AlertCircle, X, Loader2, Save, Trash2, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TextField,
  NumberField,
  DateField,
  SelectField,
  MultiSelectField,
  CheckboxField,
  UrlField,
  ProgressField,
} from "./field-types"

interface CardDetailModalProps {
  cardId: string
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
  currentUserId: string
}

export function CardDetailModal({ cardId, isOpen, onClose, onUpdate, currentUserId }: CardDetailModalProps) {
  const [card, setCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [priority, setPriority] = useState("medium")
  const [labels, setLabels] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [customFields, setCustomFields] = useState<any[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && cardId) {
      fetchCard()
      fetchTeamMembers()
      fetchCustomFields()
    }
  }, [isOpen, cardId])

  const fetchCard = async () => {
    try {
      console.log("[v0] Fetching card details:", cardId)
      const response = await fetch(`/api/kanban/cards/${cardId}`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Card loaded:", data)
        setCard(data)
        setTitle(data.title)
        setDescription(data.description || "")
        setDueDate(data.due_date ? new Date(data.due_date) : undefined)
        setPriority(data.priority || "medium")
        setLabels(data.labels || [])
        setAssignedTo(data.assigned_to)
      }
    } catch (error) {
      console.error("[v0] Error fetching card:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      console.log("[v0] Fetching team members")
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Team members loaded:", data.length)
        setTeamMembers(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching team members:", error)
    }
  }

  const fetchCustomFields = async () => {
    try {
      console.log("[v0] Fetching custom fields for card:", cardId)

      // Get the board ID from the card
      const cardResponse = await fetch(`/api/kanban/cards/${cardId}`)
      if (!cardResponse.ok) return

      const cardData = await cardResponse.json()
      const boardId = cardData.board_id

      // Fetch custom field definitions
      const fieldsResponse = await fetch(`/api/kanban/boards/${boardId}/custom-fields`)
      if (fieldsResponse.ok) {
        const fields = await fieldsResponse.json()
        console.log("[v0] Custom fields loaded:", fields.length)
        setCustomFields(fields)

        // Fetch custom field values for this card
        const valuesResponse = await fetch(`/api/kanban/cards/${cardId}/custom-field-values`)
        if (valuesResponse.ok) {
          const values = await valuesResponse.json()
          const valuesMap: Record<string, string> = {}
          values.forEach((v: any) => {
            valuesMap[v.custom_field_id] = v.field_value
          })
          console.log("[v0] Custom field values loaded:", Object.keys(valuesMap).length)
          setCustomFieldValues(valuesMap)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching custom fields:", error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log("[v0] Saving card:", cardId)
      const response = await fetch(`/api/kanban/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          due_date: dueDate?.toISOString(),
          priority,
          labels,
          assigned_to: assignedTo,
        }),
      })

      if (response.ok) {
        console.log("[v0] Card saved successfully")

        await saveCustomFieldValues()

        // Log activity
        await fetch(`/api/kanban/cards/${cardId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_type: "updated",
            activity_data: {},
          }),
        })

        onUpdate?.()
        onClose()
      }
    } catch (error) {
      console.error("[v0] Error saving card:", error)
    } finally {
      setSaving(false)
    }
  }

  const saveCustomFieldValues = async () => {
    try {
      console.log("[v0] Saving custom field values")
      await fetch(`/api/kanban/cards/${cardId}/custom-field-values`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: customFieldValues }),
      })
      console.log("[v0] Custom field values saved")
    } catch (error) {
      console.error("[v0] Error saving custom field values:", error)
    }
  }

  const updateCustomFieldValue = (fieldId: string, value: string) => {
    console.log("[v0] Updating custom field value:", fieldId, value)
    setCustomFieldValues({ ...customFieldValues, [fieldId]: value })
  }

  const renderCustomField = (field: any) => {
    const value = customFieldValues[field.id] || ""
    const commonProps = {
      label: field.field_name,
      value,
      onChange: (newValue: string) => updateCustomFieldValue(field.id, newValue),
      required: field.is_required,
    }

    switch (field.field_type) {
      case "text":
        return <TextField key={field.id} {...commonProps} />
      case "number":
        return <NumberField key={field.id} {...commonProps} />
      case "date":
        return <DateField key={field.id} {...commonProps} />
      case "select":
        return <SelectField key={field.id} {...commonProps} options={field.field_options?.options || []} />
      case "multiselect":
        return <MultiSelectField key={field.id} {...commonProps} options={field.field_options?.options || []} />
      case "checkbox":
        return <CheckboxField key={field.id} {...commonProps} />
      case "url":
        return <UrlField key={field.id} {...commonProps} />
      case "progress":
        return <ProgressField key={field.id} {...commonProps} />
      default:
        return <TextField key={field.id} {...commonProps} />
    }
  }

  const handleArchive = async () => {
    if (!confirm("Archive this card?")) return

    try {
      console.log("[v0] Archiving card:", cardId)
      const response = await fetch(`/api/kanban/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: true }),
      })

      if (response.ok) {
        console.log("[v0] Card archived")

        // Log activity
        await fetch(`/api/kanban/cards/${cardId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_type: "archived",
            activity_data: {},
          }),
        })

        onUpdate?.()
        onClose()
      }
    } catch (error) {
      console.error("[v0] Error archiving card:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this card permanently?")) return

    try {
      console.log("[v0] Deleting card:", cardId)
      const response = await fetch(`/api/kanban/cards/${cardId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("[v0] Card deleted")
        onUpdate?.()
        onClose()
      }
    } catch (error) {
      console.error("[v0] Error deleting card:", error)
    }
  }

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()])
      setNewLabel("")
    }
  }

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>View and edit card information, add comments, and track activity</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="min-h-[100px]"
            />
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Assigned To */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned To
              </Label>
              <Select
                value={assignedTo || "unassigned"}
                onValueChange={(value) => setAssignedTo(value === "unassigned" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? formatDate(dueDate) : "No due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Labels
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label) => (
                <Badge key={label} variant="secondary" className="gap-1">
                  {label}
                  <button onClick={() => removeLabel(label)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add label..."
                onKeyPress={(e) => e.key === "Enter" && addLabel()}
              />
              <Button onClick={addLabel} variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>

          {customFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-base font-semibold">Custom Fields</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customFields.map((field) => renderCustomField(field))}
              </div>
            </div>
          )}

          {/* Tabs for Comments, Activity, and Reminders */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="mt-4">
              <CardComments cardId={cardId} currentUserId={currentUserId} />
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <CardActivityFeed cardId={cardId} />
            </TabsContent>
            <TabsContent value="reminders" className="mt-4">
              <CardReminders cardId={cardId} currentUserId={currentUserId} />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button onClick={handleArchive} variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button onClick={handleDelete} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
