"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailBuilderDialog } from "../email-builder/email-builder-dialog"
import { Palette } from "lucide-react"

interface Contact {
  id: string
  email: string
  full_name: string
}

interface CreateNewsletterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (newsletter: any) => Promise<{ data: any; error: any }>
  members: Contact[]
  visitors: Contact[]
  churchTenantId: string
}

export function CreateNewsletterDialog({
  open,
  onOpenChange,
  onCreate,
  members,
  visitors,
  churchTenantId,
}: CreateNewsletterDialogProps) {
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
  })
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [sendNow, setSendNow] = useState(false)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [useVisualBuilder, setUseVisualBuilder] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const allRecipients = [
        ...selectedMembers.map((id) => members.find((m) => m.id === id)!),
        ...selectedVisitors.map((id) => visitors.find((v) => v.id === id)!),
      ]

      const { data: newsletter, error: newsletterError } = await onCreate({
        subject: formData.subject,
        content: formData.content,
      })

      if (newsletterError) throw newsletterError

      if (sendNow && newsletter) {
        const response = await fetch("/api/newsletter/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newsletterId: newsletter.id,
            recipients: allRecipients.map((r) => ({ email: r.email, name: r.full_name })),
            subject: formData.subject,
            content: formData.content,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send newsletter")
        }
      }

      setFormData({ subject: "", content: "" })
      setSelectedMembers([])
      setSelectedVisitors([])
      setSendNow(false)
      onOpenChange(false)
    } catch (err) {
      console.error("[v0] Error creating newsletter:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const toggleVisitor = (id: string) => {
    setSelectedVisitors((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const selectAllMembers = () => {
    setSelectedMembers(selectedMembers.length === members.length ? [] : members.map((m) => m.id))
  }

  const selectAllVisitors = () => {
    setSelectedVisitors(selectedVisitors.length === visitors.length ? [] : visitors.map((v) => v.id))
  }

  const totalRecipients = selectedMembers.length + selectedVisitors.length

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Newsletter</DialogTitle>
            <DialogDescription>Compose and send a newsletter to your members and visitors</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Content</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setBuilderOpen(true)}>
                  <Palette className="mr-2 h-4 w-4" />
                  Use Visual Builder
                </Button>
              </div>

              <div className="space-y-2">
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  required
                  placeholder="Enter your newsletter content or use the visual builder..."
                />
              </div>

              <div className="space-y-2">
                <Label>Recipients ({totalRecipients} selected)</Label>
                <Tabs defaultValue="members" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="members">Members ({selectedMembers.length})</TabsTrigger>
                    <TabsTrigger value="visitors">Visitors ({selectedVisitors.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="members" className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllMembers}
                      className="w-full bg-transparent"
                    >
                      {selectedMembers.length === members.length ? "Deselect All" : "Select All"}
                    </Button>
                    <ScrollArea className="h-48 border rounded-lg p-2">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={() => toggleMember(member.id)}
                          />
                          <label htmlFor={`member-${member.id}`} className="text-sm flex-1 cursor-pointer">
                            {member.full_name} ({member.email})
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="visitors" className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllVisitors}
                      className="w-full bg-transparent"
                    >
                      {selectedVisitors.length === visitors.length ? "Deselect All" : "Select All"}
                    </Button>
                    <ScrollArea className="h-48 border rounded-lg p-2">
                      {visitors.map((visitor) => (
                        <div key={visitor.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={`visitor-${visitor.id}`}
                            checked={selectedVisitors.includes(visitor.id)}
                            onCheckedChange={() => toggleVisitor(visitor.id)}
                          />
                          <label htmlFor={`visitor-${visitor.id}`} className="text-sm flex-1 cursor-pointer">
                            {visitor.full_name} ({visitor.email})
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendNow"
                  checked={sendNow}
                  onCheckedChange={(checked) => setSendNow(checked as boolean)}
                />
                <label htmlFor="sendNow" className="text-sm cursor-pointer">
                  Send newsletter immediately
                </label>
              </div>
            </div>

            <div className="pt-4 border-t mt-4">
              <Button type="submit" className="w-full" disabled={loading || totalRecipients === 0}>
                {loading ? "Processing..." : sendNow ? "Create & Send Newsletter" : "Save as Draft"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <EmailBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        churchTenantId={churchTenantId}
        onSaveTemplate={(template) => {
          // Optionally use the template
          setBuilderOpen(false)
        }}
      />
    </>
  )
}
