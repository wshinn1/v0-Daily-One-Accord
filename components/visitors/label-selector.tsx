"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Label {
  id: string
  name: string
  color: string
}

interface LabelSelectorProps {
  visitorId: string
  selectedLabels: Label[]
  onLabelsChange: (labels: Label[]) => void
}

const colorClasses = {
  red: "bg-red-100 text-red-800 hover:bg-red-200",
  orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  green: "bg-green-100 text-green-800 hover:bg-green-200",
  blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
}

export function LabelSelector({ visitorId, selectedLabels, onLabelsChange }: LabelSelectorProps) {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadLabels()
  }, [])

  const loadLabels = async () => {
    try {
      const response = await fetch("/api/labels")
      const data = await response.json()
      if (response.ok) {
        setAvailableLabels(data.labels || [])
      }
    } catch (error) {
      console.error("[v0] Error loading labels:", error)
    }
  }

  const handleAddLabel = async (label: Label) => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label_id: label.id }),
      })

      if (response.ok) {
        onLabelsChange([...selectedLabels, label])
        toast({
          title: "Label added",
          description: `Added "${label.name}" label`,
        })
      }
    } catch (error) {
      console.error("[v0] Error adding label:", error)
      toast({
        title: "Error",
        description: "Failed to add label",
        variant: "destructive",
      })
    }
  }

  const handleRemoveLabel = async (label: Label) => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/labels?label_id=${label.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onLabelsChange(selectedLabels.filter((l) => l.id !== label.id))
        toast({
          title: "Label removed",
          description: `Removed "${label.name}" label`,
        })
      }
    } catch (error) {
      console.error("[v0] Error removing label:", error)
      toast({
        title: "Error",
        description: "Failed to remove label",
        variant: "destructive",
      })
    }
  }

  const isLabelSelected = (labelId: string) => selectedLabels.some((l) => l.id === labelId)

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {selectedLabels.map((label) => (
        <Badge
          key={label.id}
          className={`${colorClasses[label.color as keyof typeof colorClasses] || colorClasses.gray} cursor-pointer group`}
          onClick={() => handleRemoveLabel(label)}
        >
          {label.name}
          <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Badge>
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 px-2 bg-transparent">
            <Plus className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="space-y-1">
            {availableLabels.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No labels available</p>
            ) : (
              availableLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => {
                    if (isLabelSelected(label.id)) {
                      handleRemoveLabel(label)
                    } else {
                      handleAddLabel(label)
                    }
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-accent transition-colors"
                >
                  <Badge className={colorClasses[label.color as keyof typeof colorClasses] || colorClasses.gray}>
                    {label.name}
                  </Badge>
                  {isLabelSelected(label.id) && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
