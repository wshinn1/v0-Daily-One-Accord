"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Automation {
  id: string
  name: string
  description: string
  trigger_type: string
  trigger_config: any
  action_type: string
  action_config: any
  is_active: boolean
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "visitor_added",
    trigger_config: {},
    action_type: "assign_to_user",
    action_config: {},
    is_active: true,
  })

  useEffect(() => {
    loadAutomations()
  }, [])

  const loadAutomations = async () => {
    try {
      const response = await fetch("/api/automations")
      const data = await response.json()
      setAutomations(data.automations || [])
    } catch (error) {
      console.error("[v0] Error loading automations:", error)
      toast({ title: "Error", description: "Failed to load automations", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const url = editingAutomation ? `/api/automations/${editingAutomation.id}` : "/api/automations"
      const method = editingAutomation ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save automation")

      toast({ title: "Success", description: `Automation ${editingAutomation ? "updated" : "created"} successfully` })
      setIsDialogOpen(false)
      resetForm()
      loadAutomations()
    } catch (error) {
      console.error("[v0] Error saving automation:", error)
      toast({ title: "Error", description: "Failed to save automation", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return

    try {
      const response = await fetch(`/api/automations/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete automation")

      toast({ title: "Success", description: "Automation deleted successfully" })
      loadAutomations()
    } catch (error) {
      console.error("[v0] Error deleting automation:", error)
      toast({ title: "Error", description: "Failed to delete automation", variant: "destructive" })
    }
  }

  const handleToggle = async (automation: Automation) => {
    try {
      const response = await fetch(`/api/automations/${automation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...automation, is_active: !automation.is_active }),
      })

      if (!response.ok) throw new Error("Failed to toggle automation")

      toast({ title: "Success", description: `Automation ${!automation.is_active ? "enabled" : "disabled"}` })
      loadAutomations()
    } catch (error) {
      console.error("[v0] Error toggling automation:", error)
      toast({ title: "Error", description: "Failed to toggle automation", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      trigger_type: "visitor_added",
      trigger_config: {},
      action_type: "assign_to_user",
      action_config: {},
      is_active: true,
    })
    setEditingAutomation(null)
  }

  const openEditDialog = (automation: Automation) => {
    setEditingAutomation(automation)
    setFormData({
      name: automation.name,
      description: automation.description,
      trigger_type: automation.trigger_type,
      trigger_config: automation.trigger_config,
      action_type: automation.action_type,
      action_config: automation.action_config,
      is_active: automation.is_active,
    })
    setIsDialogOpen(true)
  }

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      visitor_added: "New Visitor Added",
      status_changed: "Status Changed",
      assigned: "Visitor Assigned",
      due_date_approaching: "Due Date Approaching",
    }
    return labels[type] || type
  }

  const getActionLabel = (type: string) => {
    const labels: Record<string, string> = {
      assign_to_user: "Assign to User",
      move_to_status: "Move to Status",
      send_slack_notification: "Send Slack Notification",
      add_label: "Add Label",
    }
    return labels[type] || type
  }

  if (loading) {
    return <div className="p-8">Loading automations...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visitor Automations</h1>
          <p className="text-muted-foreground">Automate your visitor management workflow</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAutomation ? "Edit" : "Create"} Automation</DialogTitle>
              <DialogDescription>Set up automated actions for your visitor management</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Automation Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Auto-assign new visitors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this automation does"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger">When this happens...</Label>
                  <Select
                    value={formData.trigger_type}
                    onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
                  >
                    <SelectTrigger id="trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor_added">New Visitor Added</SelectItem>
                      <SelectItem value="status_changed">Status Changed</SelectItem>
                      <SelectItem value="assigned">Visitor Assigned</SelectItem>
                      <SelectItem value="due_date_approaching">Due Date Approaching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Do this...</Label>
                  <Select
                    value={formData.action_type}
                    onValueChange={(value) => setFormData({ ...formData, action_type: value })}
                  >
                    <SelectTrigger id="action">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_to_user">Assign to User</SelectItem>
                      <SelectItem value="move_to_status">Move to Status</SelectItem>
                      <SelectItem value="send_slack_notification">Send Slack Notification</SelectItem>
                      <SelectItem value="add_label">Add Label</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingAutomation ? "Update" : "Create"} Automation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {automations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first automation to streamline your visitor management
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Automation
              </Button>
            </CardContent>
          </Card>
        ) : (
          automations.map((automation) => (
            <Card key={automation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {automation.name}
                      {automation.is_active && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      )}
                    </CardTitle>
                    <CardDescription>{automation.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={automation.is_active} onCheckedChange={() => handleToggle(automation)} />
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(automation)}>
                      <Zap className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(automation.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">When:</span>
                    <span className="font-medium">{getTriggerLabel(automation.trigger_type)}</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Then:</span>
                    <span className="font-medium">{getActionLabel(automation.action_type)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
