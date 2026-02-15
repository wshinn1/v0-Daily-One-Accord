"use client"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { useState } from "react"

interface MultiSelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  required?: boolean
  disabled?: boolean
}

export function MultiSelectField({ label, value, onChange, options, required, disabled }: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const selectedValues = value ? value.split(",").filter(Boolean) : []

  const toggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option]
    onChange(newValues.join(","))
  }

  const removeOption = (option: string) => {
    const newValues = selectedValues.filter((v) => v !== option)
    onChange(newValues.join(","))
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedValues.length > 0 ? `${selectedValues.length} selected` : `Select ${label.toLowerCase()}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="max-h-64 overflow-auto p-1">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted rounded-sm"
                onClick={() => toggleOption(option)}
              >
                <div
                  className={`h-4 w-4 border rounded flex items-center justify-center ${selectedValues.includes(option) ? "bg-primary border-primary" : ""}`}
                >
                  {selectedValues.includes(option) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((option) => (
            <Badge key={option} variant="secondary" className="gap-1">
              {option}
              <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeOption(option)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
