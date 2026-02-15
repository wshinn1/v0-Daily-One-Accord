"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Archive } from "lucide-react"
import { RundownCard } from "./rundown-card"
import { RundownEditor } from "./rundown-editor"
import { CreateRundownDialog } from "./create-rundown-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RundownManagerProps {
  rundowns: any[]
  archivedRundowns: any[]
  churchMembers: any[]
  churchTenantId: string
  defaultSlackChannel?: string
}

export function RundownManager({
  rundowns: initialRundowns,
  archivedRundowns: initialArchivedRundowns,
  churchMembers,
  churchTenantId,
  defaultSlackChannel,
}: RundownManagerProps) {
  const [rundowns, setRundowns] = useState(initialRundowns)
  const [archivedRundowns, setArchivedRundowns] = useState(initialArchivedRundowns)
  const [selectedRundown, setSelectedRundown] = useState<any>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleRundownCreated = (newRundown: any) => {
    setRundowns([newRundown, ...rundowns])
    setShowCreateDialog(false)
    setSelectedRundown(newRundown)
  }

  const handleRundownUpdated = (updatedRundown: any) => {
    if (updatedRundown.is_archived) {
      setRundowns(rundowns.filter((r) => r.id !== updatedRundown.id))
      setArchivedRundowns([updatedRundown, ...archivedRundowns])
    } else {
      setRundowns(rundowns.map((r) => (r.id === updatedRundown.id ? updatedRundown : r)))
      setArchivedRundowns(archivedRundowns.filter((r) => r.id !== updatedRundown.id))
    }
    setSelectedRundown(updatedRundown)
  }

  const handleRundownDeleted = (rundownId: string) => {
    setRundowns(rundowns.filter((r) => r.id !== rundownId))
    setArchivedRundowns(archivedRundowns.filter((r) => r.id !== rundownId))
    setSelectedRundown(null)
  }

  if (selectedRundown) {
    return (
      <RundownEditor
        rundown={selectedRundown}
        churchMembers={churchMembers}
        churchTenantId={churchTenantId}
        defaultSlackChannel={defaultSlackChannel}
        onBack={() => setSelectedRundown(null)}
        onUpdate={handleRundownUpdated}
        onDelete={handleRundownDeleted}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Rundowns</h1>
          <p className="text-muted-foreground">Plan and manage your church service and event schedules</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Rundown
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Rundowns ({rundowns.length})</TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="mr-2 h-4 w-4" />
            Archived ({archivedRundowns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {rundowns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <h3 className="text-lg font-semibold">No rundowns yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first event rundown to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Rundown
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rundowns.map((rundown) => (
                <RundownCard key={rundown.id} rundown={rundown} onClick={() => setSelectedRundown(rundown)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4 mt-6">
          {archivedRundowns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Archive className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No archived rundowns</h3>
              <p className="text-sm text-muted-foreground">Archived rundowns will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archivedRundowns.map((rundown) => (
                <RundownCard key={rundown.id} rundown={rundown} onClick={() => setSelectedRundown(rundown)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateRundownDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        churchMembers={churchMembers}
        churchTenantId={churchTenantId}
        onRundownCreated={handleRundownCreated}
      />
    </div>
  )
}
