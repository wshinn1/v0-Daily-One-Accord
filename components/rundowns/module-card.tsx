"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Clock, User, Trash2, Edit } from "lucide-react"
import { EditModuleDialog } from "./edit-module-dialog"

interface ModuleCardProps {
  module: any
  index: number
  churchMembers: any[]
  onUpdate: (module: any) => void
  onDelete: (moduleId: string) => void
}

export function ModuleCard({ module, index, churchMembers, onUpdate, onDelete }: ModuleCardProps) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <h3 className="font-semibold">{module.title}</h3>
                  </div>
                  {module.description && <p className="text-sm text-muted-foreground mt-1">{module.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(module.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pl-11">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {module.start_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {module.start_time}
                {module.duration_minutes && ` (${module.duration_minutes} min)`}
              </div>
            )}
            {module.assigned_user && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {module.assigned_user.full_name}
              </div>
            )}
          </div>
          {module.notes && <p className="text-sm text-muted-foreground mt-2 italic">{module.notes}</p>}
        </CardContent>
      </Card>

      <EditModuleDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        module={module}
        churchMembers={churchMembers}
        onModuleUpdated={onUpdate}
      />
    </>
  )
}
