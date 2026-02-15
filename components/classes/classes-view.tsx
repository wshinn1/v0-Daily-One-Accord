"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ClassesList } from "./classes-list"
import { CreateClassDialog } from "./create-class-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface ClassesViewProps {
  classes: any[]
  members: any[]
  churchTenantId: string
  userId: string
}

export function ClassesView({ classes: initialClasses, members, churchTenantId, userId }: ClassesViewProps) {
  const [classes, setClasses] = useState(initialClasses)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const handleCreateClass = async (classData: any) => {
    const { data, error } = await supabase
      .from("classes")
      .insert({
        ...classData,
        church_tenant_id: churchTenantId,
        created_by: userId,
      })
      .select(
        `
        *,
        teacher:teacher_id(id, full_name),
        class_enrollments(id)
      `,
      )
      .single()

    if (!error && data) {
      setClasses([data, ...classes])
    }

    return { data, error }
  }

  const handleDeleteClass = async (id: string) => {
    const { error } = await supabase.from("classes").delete().eq("id", id)

    if (!error) {
      setClasses(classes.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
          <p className="text-muted-foreground">Manage church classes and programs</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </div>

      <ClassesList classes={classes} onDelete={handleDeleteClass} churchTenantId={churchTenantId} members={members} />

      <CreateClassDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateClass}
        members={members}
      />
    </div>
  )
}
