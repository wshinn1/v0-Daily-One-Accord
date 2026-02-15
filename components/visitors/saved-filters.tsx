"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bookmark, Trash2 } from "lucide-react"

interface SavedFilter {
  id: string
  name: string
  filter_config: any
}

interface SavedFiltersProps {
  onApplyFilter: (config: any) => void
}

export function SavedFilters({ onApplyFilter }: SavedFiltersProps) {
  const [filters, setFilters] = useState<SavedFilter[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filterName, setFilterName] = useState("")

  useEffect(() => {
    fetchFilters()
  }, [])

  const fetchFilters = async () => {
    const response = await fetch("/api/saved-filters")
    const data = await response.json()
    setFilters(data.filters || [])
  }

  const saveCurrentFilter = async (config: any) => {
    if (!filterName) return

    await fetch("/api/saved-filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: filterName,
        filter_config: config,
      }),
    })

    setFilterName("")
    setIsOpen(false)
    fetchFilters()
  }

  const deleteFilter = async (id: string) => {
    await fetch(`/api/saved-filters/${id}`, { method: "DELETE" })
    fetchFilters()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Saved Filters</h4>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Bookmark className="w-4 h-4 mr-2" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Filter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Filter name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
              <Button onClick={() => saveCurrentFilter({})} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {filters.map((filter) => (
          <div key={filter.id} className="flex items-center justify-between p-2 hover:bg-accent rounded">
            <button onClick={() => onApplyFilter(filter.filter_config)} className="flex-1 text-left text-sm">
              {filter.name}
            </button>
            <Button size="icon" variant="ghost" onClick={() => deleteFilter(filter.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
