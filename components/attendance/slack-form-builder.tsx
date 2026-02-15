"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface FormField {
  id?: string
  field_name: string
  field_label: string
  field_type: string
  options?: { label: string; value: string }[]
  is_required: boolean
  display_order: number
  is_active: boolean
}

interface SlackFormBuilderProps {
  churchTenantId: string
}

export function SlackFormBuilder({ churchTenantId }: SlackFormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchFields()
  }, [churchTenantId])

  const fetchFields = async () => {
    const { data } = await supabase
      .from("slack_attendance_form_fields")
      .select("*")
      .eq("church_tenant_id", churchTenantId)
      .order("display_order")

    if (data) {
      setFields(data)
    }
    setLoading(false)
  }

  const addField = () => {
    setFields([
      ...fields,
      {
        field_name: "",
        field_label: "",
        field_type: "text",
        is_required: false,
        display_order: fields.length,
        is_active: true,
      },
    ])
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const removeField = async (index: number) => {
    const field = fields[index]
    if (field.id) {
      await supabase.from("slack_attendance_form_fields").delete().eq("id", field.id)
    }
    setFields(fields.filter((_, i) => i !== index))
  }

  const saveFields = async () => {
    try {
      for (const field of fields) {
        if (field.id) {
          await supabase
            .from("slack_attendance_form_fields")
            .update({
              field_name: field.field_name,
              field_label: field.field_label,
              field_type: field.field_type,
              options: field.options,
              is_required: field.is_required,
              display_order: field.display_order,
              is_active: field.is_active,
            })
            .eq("id", field.id)
        } else if (field.field_name && field.field_label) {
          await supabase.from("slack_attendance_form_fields").insert({
            church_tenant_id: churchTenantId,
            ...field,
          })
        }
      }

      toast({
        title: "Success",
        description: "Form fields saved successfully",
      })
      fetchFields()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form fields",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slack Attendance Form Builder</CardTitle>
        <CardDescription>Customize the fields that appear in the Slack /attendance form</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
            <GripVertical className="w-5 h-5 text-muted-foreground mt-2" />
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Name (internal)</Label>
                  <Input
                    value={field.field_name}
                    onChange={(e) => updateField(index, { field_name: e.target.value })}
                    placeholder="e.g., special_event"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field Label (shown to users)</Label>
                  <Input
                    value={field.field_label}
                    onChange={(e) => updateField(index, { field_label: e.target.value })}
                    placeholder="e.g., Special Event Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select value={field.field_type} onValueChange={(value) => updateField(index, { field_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    checked={field.is_required}
                    onCheckedChange={(checked) => updateField(index, { is_required: checked })}
                  />
                  <Label>Required</Label>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeField(index)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Button onClick={addField} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
          <Button onClick={saveFields}>Save Form Configuration</Button>
        </div>
      </CardContent>
    </Card>
  )
}
