"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Plus,
  Trash2,
  CalendarIcon,
  Send,
  Download,
  Edit,
  Archive,
  ArchiveRestore,
  Mail,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AddModuleDialog } from "./add-module-dialog"
import { EditRundownDialog } from "./edit-rundown-dialog"
import { ModuleCard } from "./module-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { TeamAssignmentsSection } from "./team-assignments-section"
import { WorshipSongsSection } from "./worship-songs-section"
import { PublishToSlackDialog } from "./publish-to-slack-dialog"
import { EmailRundownDialog } from "./email-rundown-dialog"

interface RundownEditorProps {
  rundown: any
  churchMembers: any[]
  churchTenantId: string
  defaultSlackChannel?: string
  onBack: () => void
  onUpdate: (rundown: any) => void
  onDelete: (rundownId: string) => void
}

export function RundownEditor({
  rundown: initialRundown,
  churchMembers,
  churchTenantId,
  defaultSlackChannel,
  onBack,
  onUpdate,
  onDelete,
}: RundownEditorProps) {
  const [rundown, setRundown] = useState(initialRundown)
  const [modules, setModules] = useState<any[]>([])
  const [showAddModule, setShowAddModule] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadModules()
  }, [rundown.id])

  const loadModules = async () => {
    const { data } = await supabase
      .from("rundown_modules")
      .select("*, assigned_user:assigned_to(full_name)")
      .eq("rundown_id", rundown.id)
      .order("order_index")

    if (data) {
      setModules(data)
    }
  }

  const handleToggleArchive = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("event_rundowns")
        .update({ is_archived: !rundown.is_archived })
        .eq("id", rundown.id)
        .select()
        .single()

      if (error) throw error

      const updatedRundown = { ...rundown, is_archived: !rundown.is_archived }
      setRundown(updatedRundown)
      onUpdate(updatedRundown)

      toast({
        title: rundown.is_archived ? "Rundown unarchived" : "Rundown archived",
        description: rundown.is_archived
          ? "This rundown has been moved to active rundowns."
          : "This rundown has been archived.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCalendar = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/rundowns/add-to-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rundownId: rundown.id }),
      })

      if (!response.ok) throw new Error("Failed to add to calendar")

      const updatedRundown = { ...rundown, added_to_calendar: true }
      setRundown(updatedRundown)
      onUpdate(updatedRundown)

      toast({
        title: "Added to calendar",
        description: "This rundown has been added to your church calendar.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToSlack = async (channelId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/rundowns/publish-to-slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rundownId: rundown.id, channelId }),
      })

      if (!response.ok) throw new Error("Failed to publish to Slack")

      toast({
        title: "Published to Slack",
        description: "This rundown has been shared to your Slack channel.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRundown = async () => {
    try {
      const { error } = await supabase.from("event_rundowns").delete().eq("id", rundown.id)

      if (error) throw error

      toast({
        title: "Rundown deleted",
        description: "The rundown has been deleted successfully.",
      })

      onDelete(rundown.id)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleModuleAdded = (newModule: any) => {
    setModules([...modules, newModule])
    setShowAddModule(false)
  }

  const handleModuleUpdated = (updatedModule: any) => {
    setModules(modules.map((m) => (m.id === updatedModule.id ? updatedModule : m)))
  }

  const handleModuleDeleted = async (moduleId: string) => {
    try {
      const { error } = await supabase.from("rundown_modules").delete().eq("id", moduleId)

      if (error) throw error

      setModules(modules.filter((m) => m.id !== moduleId))

      toast({
        title: "Module deleted",
        description: "The module has been removed from the rundown.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = async () => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(rundown.title, 14, 20)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    const formattedDate = new Date(rundown.event_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.text(formattedDate, 14, 28)

    if (rundown.description) {
      doc.setFontSize(10)
      doc.text(rundown.description, 14, 36, { maxWidth: 180 })
    }

    const { data: teamAssignments } = await supabase
      .from("rundown_team_assignments")
      .select(`
        id,
        service_team_categories(name),
        users(full_name)
      `)
      .eq("rundown_id", rundown.id)

    const { data: worshipSongs } = await supabase
      .from("worship_songs")
      .select("*")
      .eq("rundown_id", rundown.id)
      .order("order_index")

    let currentY = rundown.description ? 45 : 35

    if (worshipSongs && worshipSongs.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Worship Songs", 14, currentY)
      currentY += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      worshipSongs.forEach((song: any, index: number) => {
        const songDetails = []
        songDetails.push(`${index + 1}. ${song.title}`)
        if (song.artist) songDetails.push(`   Artist: ${song.artist}`)
        if (song.key) songDetails.push(`   Key: ${song.key}`)
        if (song.tempo) songDetails.push(`   Tempo: ${song.tempo}`)
        if (song.notes) songDetails.push(`   Notes: ${song.notes}`)

        songDetails.forEach((detail) => {
          doc.text(detail, 14, currentY)
          currentY += 5
        })
        currentY += 2
      })

      currentY += 5
    }

    if (teamAssignments && teamAssignments.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Service Team Assignments", 14, currentY)
      currentY += 8

      const groupedTeams: { [key: string]: string[] } = {}
      teamAssignments.forEach((assignment: any) => {
        const categoryName = assignment.service_team_categories?.name || "Other"
        const userName = assignment.users?.full_name || "Unknown"
        if (!groupedTeams[categoryName]) {
          groupedTeams[categoryName] = []
        }
        groupedTeams[categoryName].push(userName)
      })

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      Object.entries(groupedTeams).forEach(([category, members]) => {
        doc.setFont("helvetica", "bold")
        doc.text(`${category}:`, 14, currentY)
        doc.setFont("helvetica", "normal")
        doc.text(members.join(", "), 14, currentY + 5)
        currentY += 12
      })

      currentY += 5
    }

    const tableData = modules.map((module, index) => [
      module.start_time || "-",
      module.title,
      module.assigned_user?.full_name || "Unassigned",
      module.duration_minutes ? `${module.duration_minutes} min` : "-",
      module.notes || "-",
    ])

    autoTable(doc, {
      startY: currentY,
      head: [["Time", "Module", "Assigned To", "Duration", "Notes"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 50 },
      },
    })

    const fileName = `${rundown.title.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)

    toast({
      title: "PDF exported",
      description: "Your rundown has been exported as a PDF.",
    })
  }

  const handleRundownUpdated = (updatedRundown: any) => {
    setRundown(updatedRundown)
    onUpdate(updatedRundown)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rundowns
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          {!rundown.added_to_calendar && (
            <Button variant="outline" onClick={handleAddToCalendar} disabled={loading}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
          )}
          <Button onClick={() => setShowPublishDialog(true)} disabled={loading}>
            <Send className="mr-2 h-4 w-4" />
            Publish to Slack
          </Button>
          <Button variant="outline" onClick={handleToggleArchive} disabled={loading}>
            {rundown.is_archived ? (
              <>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Unarchive
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h1 className="text-3xl font-bold mb-2">{rundown.title}</h1>
        <p className="text-muted-foreground mb-4">
          {new Date(rundown.event_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {rundown.description && <p className="text-sm text-muted-foreground">{rundown.description}</p>}
      </div>

      <TeamAssignmentsSection rundownId={rundown.id} churchTenantId={churchTenantId} />

      <WorshipSongsSection rundownId={rundown.id} churchTenantId={churchTenantId} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Rundown Modules</h2>
          <Button onClick={() => setShowAddModule(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        </div>

        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <h3 className="text-lg font-semibold">No modules yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add modules to build your event schedule</p>
            <Button onClick={() => setShowAddModule(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={index}
                churchMembers={churchMembers}
                onUpdate={handleModuleUpdated}
                onDelete={handleModuleDeleted}
              />
            ))}
          </div>
        )}
      </div>

      <AddModuleDialog
        open={showAddModule}
        onOpenChange={setShowAddModule}
        rundownId={rundown.id}
        churchMembers={churchMembers}
        orderIndex={modules.length}
        onModuleAdded={handleModuleAdded}
      />

      <EditRundownDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        rundown={rundown}
        onRundownUpdated={handleRundownUpdated}
      />

      <EmailRundownDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        rundownId={rundown.id}
        rundownTitle={rundown.title}
      />

      <PublishToSlackDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        rundownId={rundown.id}
        defaultChannel={defaultSlackChannel}
        onPublish={handlePublishToSlack}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rundown</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rundown? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRundown}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
