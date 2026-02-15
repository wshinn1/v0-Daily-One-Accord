"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BulkInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  currentUserId: string
}

interface InviteResult {
  email: string
  status: "pending" | "success" | "error"
  message?: string
}

export function BulkInviteDialog({ open, onOpenChange, tenantId, currentUserId }: BulkInviteDialogProps) {
  const [emails, setEmails] = useState("")
  const [role, setRole] = useState("member")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<InviteResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowResults(true)

    // Parse emails (comma or newline separated)
    const emailList = emails
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    // Initialize results
    const initialResults: InviteResult[] = emailList.map((email) => ({
      email,
      status: "pending",
    }))
    setResults(initialResults)

    // Send invitations one by one
    for (let i = 0; i < emailList.length; i++) {
      const email = emailList[i]

      try {
        const response = await fetch("/api/users/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            role,
            churchTenantId: tenantId,
            invitedBy: currentUserId,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i
                ? {
                    ...r,
                    status: "success",
                    message: data.warning || "Invitation sent successfully",
                  }
                : r,
            ),
          )
        } else {
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i
                ? {
                    ...r,
                    status: "error",
                    message: data.error || "Failed to send invitation",
                  }
                : r,
            ),
          )
        }
      } catch (error) {
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "error",
                  message: "Network error",
                }
              : r,
          ),
        )
      }
    }

    setIsSubmitting(false)
  }

  const handleClose = () => {
    setEmails("")
    setRole("member")
    setResults([])
    setShowResults(false)
    onOpenChange(false)
    window.location.reload()
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bulk Invite Users</DialogTitle>
          <DialogDescription>
            Invite multiple users at once by entering their email addresses (comma or newline separated)
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses</Label>
              <Textarea
                id="emails"
                placeholder="user1@example.com, user2@example.com&#10;user3@example.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                required
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Enter email addresses separated by commas or new lines</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="volunteer_team">Volunteer Team</SelectItem>
                  <SelectItem value="pastoral_team">Pastoral Team</SelectItem>
                  <SelectItem value="admin_staff">Admin Staff</SelectItem>
                  <SelectItem value="media_team">Media Team</SelectItem>
                  <SelectItem value="lead_admin">Lead Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Each user will receive an email invitation with a link to sign up and join your church.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !emails.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Invitations...
                  </>
                ) : (
                  "Send Invitations"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">{successCount} Successful</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium">{errorCount} Failed</span>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg p-4">
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    {result.status === "pending" && (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-0.5" />
                    )}
                    {result.status === "success" && <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />}
                    {result.status === "error" && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.email}</p>
                      {result.message && (
                        <p
                          className={`text-sm ${result.status === "error" ? "text-red-600" : "text-muted-foreground"}`}
                        >
                          {result.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button onClick={handleClose} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Done"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
