"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CustomField {
  id: string
  field_name: string
  field_type: "text" | "number" | "date" | "select" | "checkbox"
  field_options?: string[]
  is_required: boolean
}

interface CustomFieldValue {
  id: string
  field_id: string
  field_value: string | null
  field: CustomField
}

interface CustomFieldsEditorProps {
  visitorId: string
}

export function CustomFieldsEditor({ visitorId }: CustomFieldsEditorProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadFieldsAndValues()
  }, [visitorId])

  const loadFieldsAndValues = async () => {
    try {
      const [fieldsRes, valuesRes] = await Promise.all([
        fetch("/api/custom-fields"),
        fetch(`/api/visitors/${visitorId}/custom-fields`),
      ])

      const fieldsData = await fieldsRes.json()
      const valuesData = await valuesRes.json()

      if (fieldsRes.ok) {
        setFields(fieldsData.fields || [])
      }

      if (valuesRes.ok) {
        const valuesMap: Record<string, string> = {}
        valuesData.values?.forEach((v: CustomFieldValue) => {
          valuesMap[v.field_id] = v.field_value || ""
        })
        setValues(valuesMap)
      }
    } catch (error) {
      console.error("[v0] Error loading custom fields:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValueChange = async (fieldId: string, value: string) => {
    setValues({ ...values, [fieldId]: value })

    try {
      const response = await fetch(`/api/visitors/${visitorId}/custom-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: fieldId, field_value: value }),
      })

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to save custom field",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error saving custom field:", error)
      toast({
        title: "Error",
        description: "Failed to save custom field",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading custom fields...</div>
  }

  if (fields.length === 0) {
    return <div className="text-sm text-muted-foreground">No custom fields configured</div>
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>
            {field.field_name}
            {field.is_required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {field.field_type === "text" && (
            <Input
              id={field.id}
              value={values[field.id] || ""}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
              required={field.is_required}
            />
          )}

          {field.field_type === "number" && (
            <Input
              id={field.id}
              type="number"
              value={values[field.id] || ""}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
              required={field.is_required}
            />
          )}

          {field.field_type === "date" && (
            <Input
              id={field.id}
              type="date"
              value={values[field.id] || ""}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
              required={field.is_required}
            />
          )}

          {field.field_type === "select" && (
            <Select value={values[field.id] || ""} onValueChange={(value) => handleValueChange(field.id, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.field_options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.field_type === "checkbox" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={values[field.id] === "true"}
                onCheckedChange={(checked) => handleValueChange(field.id, checked ? "true" : "false")}
              />
              <label
                htmlFor={field.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Yes
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
