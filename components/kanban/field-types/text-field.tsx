"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}

export function TextField({ label, value, onChange, required, disabled }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="transition-all"
      />
    </div>
  )
}
