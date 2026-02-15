"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Link2, Trash2 } from "lucide-react"

interface Dependency {
  id: string
  dependency_type: string
  target_visitor: {
    id: string
    full_name: string
    status: string
  }
  notes: string | null
}

interface DependencySelectorProps {
  visitorId: string
  allVisitors: { id: string; full_name: string }[]
}

export function DependencySelector({ visitorId, allVisitors }: DependencySelectorProps) {
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState("")
  const [dependencyType, setDependencyType] = useState("related_to")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchDependencies()
  }, [visitorId])

  const fetchDependencies = async () => {
    const response = await fetch(`/api/visitors/${visitorId}/dependencies`)
    const data = await response.json()
    setDependencies(data.dependencies || [])
  }

  const addDependency = async () => {
    if (!selectedVisitor) return

    await fetch(`/api/visitors/${visitorId}/dependencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_visitor_id: selectedVisitor,
        dependency_type: dependencyType,
        notes,
      }),
    })

    setSelectedVisitor("")
    setNotes("")
    setIsOpen(false)
    fetchDependencies()
  }

  const removeDependency = async (dependencyId: string) => {
    await fetch(`/api/visitors/${visitorId}/dependencies/${dependencyId}`, {
      method: "DELETE",
    })
    fetchDependencies()
  }

  const dependencyTypeLabels: Record<string, string> = {
    related_to: "Related To",
    blocked_by: "Blocked By",
    duplicate_of: "Duplicate Of",
    family_member: "Family Member",
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Dependencies</h4>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Link2 className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Dependency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Visitor</Label>
                <Select value={selectedVisitor} onValueChange={setSelectedVisitor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visitor" />
                  </SelectTrigger>
                  <SelectContent>
                    {allVisitors
                      .filter((v) => v.id !== visitorId)
                      .map((visitor) => (
                        <SelectItem key={visitor.id} value={visitor.id}>
                          {visitor.full_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Relationship Type</Label>
                <Select value={dependencyType} onValueChange={setDependencyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="related_to">Related To</SelectItem>
                    <SelectItem value="blocked_by">Blocked By</SelectItem>
                    <SelectItem value="duplicate_of">Duplicate Of</SelectItem>
                    <SelectItem value="family_member">Family Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional context..."
                />
              </div>

              <Button onClick={addDependency} className="w-full">
                Add Dependency
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {dependencies.map((dep) => (
          <div key={dep.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex-1">
              <div className="text-sm font-medium">{dep.target_visitor.full_name}</div>
              <div className="text-xs text-muted-foreground">{dependencyTypeLabels[dep.dependency_type]}</div>
              {dep.notes && <div className="text-xs text-muted-foreground mt-1">{dep.notes}</div>}
            </div>
            <Button size="icon" variant="ghost" onClick={() => removeDependency(dep.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {dependencies.length === 0 && <p className="text-sm text-muted-foreground">No dependencies yet</p>}
      </div>
    </div>
  )
}
