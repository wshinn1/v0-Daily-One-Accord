"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"

interface FilterCondition {
  field: string
  operator: string
  value: string
}

interface AdvancedFilterBuilderProps {
  onApplyFilter: (conditions: FilterCondition[]) => void
  staffMembers: { id: string; full_name: string }[]
}

export function AdvancedFilterBuilder({ onApplyFilter, staffMembers }: AdvancedFilterBuilderProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([{ field: "status", operator: "equals", value: "" }])

  const fields = [
    { value: "status", label: "Status" },
    { value: "assigned_to", label: "Assigned To" },
    { value: "due_date", label: "Due Date" },
    { value: "full_name", label: "Name" },
    { value: "email", label: "Email" },
  ]

  const operators = [
    { value: "equals", label: "Equals" },
    { value: "contains", label: "Contains" },
    { value: "greater_than", label: "Greater Than" },
    { value: "less_than", label: "Less Than" },
  ]

  const addCondition = () => {
    setConditions([...conditions, { field: "status", operator: "equals", value: "" }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    setConditions(newConditions)
  }

  const handleApply = () => {
    onApplyFilter(conditions.filter((c) => c.value))
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Advanced Filters</h3>
        <Button size="sm" variant="outline" onClick={addCondition}>
          <Plus className="w-4 h-4 mr-2" />
          Add Condition
        </Button>
      </div>

      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label>Field</Label>
              <Select value={condition.field} onValueChange={(value) => updateCondition(index, { field: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Operator</Label>
              <Select value={condition.operator} onValueChange={(value) => updateCondition(index, { operator: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Value</Label>
              {condition.field === "status" ? (
                <Select value={condition.value} onValueChange={(value) => updateCondition(index, { value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Visitors</SelectItem>
                    <SelectItem value="follow_up">Needs Follow Up</SelectItem>
                    <SelectItem value="engaged">Engaged Visitors</SelectItem>
                  </SelectContent>
                </Select>
              ) : condition.field === "assigned_to" ? (
                <Select value={condition.value} onValueChange={(value) => updateCondition(index, { value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staffMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={condition.field === "due_date" ? "date" : "text"}
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="Enter value"
                />
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeCondition(index)}
              disabled={conditions.length === 1}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={() => setConditions([{ field: "status", operator: "equals", value: "" }])}>
          Clear
        </Button>
      </div>
    </div>
  )
}
