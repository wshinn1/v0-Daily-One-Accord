"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface CheckboxFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}

export function CheckboxField({ label, value, onChange, required, disabled }: CheckboxFieldProps) {
  const isChecked = value === "true"

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={label}
        checked={isChecked}
        onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
        disabled={disabled}
      />
      <Label htmlFor={label} className="text-sm font-medium cursor-pointer">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
  )
}
