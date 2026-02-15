"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface ProgressFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}

export function ProgressField({ label, value, onChange, required, disabled }: ProgressFieldProps) {
  const numValue = value ? Number.parseInt(value) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <span className="text-sm font-semibold text-primary">{numValue}%</span>
      </div>
      <Slider
        value={[numValue]}
        onValueChange={(values) => onChange(values[0].toString())}
        max={100}
        step={5}
        disabled={disabled}
        className="w-full"
      />
    </div>
  )
}
