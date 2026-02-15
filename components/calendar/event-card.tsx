"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  UserPlus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditEventDialog } from "./edit-event-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Event {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  leader: { id: string; full_name: string } | null
  creator: { id: string; full_name: string } | null
  max_attendees: number | null
  is_public: boolean
  allow_registration: boolean
}

interface Leader {
  id: string
  full_name: string
}

interface EventCardProps {
  event: Event
  leaders: Leader[]
  onUpdate: (id: string, updates: Partial<Event>) => void
  onDelete: (id: string) => void
  churchTenantId: string
  isPast?: boolean
}

export function EventCard({ event, leaders, onUpdate, onDelete, churchTenantId, isPast = false }: EventCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false)

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)

  const embedUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/embed/event/${event.id}`
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)
  }

  return (
    <>
      <Card className={isPast ? "opacity-60" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{event.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                {event.is_public && <Badge variant="secondary">Public</Badge>}
                {event.allow_registration && <Badge variant="outline">Registration Open</Badge>}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {event.is_public && event.allow_registration && (
                  <DropdownMenuItem onClick={() => setIsEmbedDialogOpen(true)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get Embed Code
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {startDate.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
            {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
          )}
          {event.leader && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              {event.leader.full_name}
            </div>
          )}
          {event.max_attendees && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Max {event.max_attendees} attendees
            </div>
          )}
          {event.creator && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserPlus className="w-4 h-4" />
              Created by {event.creator.full_name}
            </div>
          )}
          {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
        </CardContent>
      </Card>

      <EditEventDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        event={event}
        leaders={leaders}
        onUpdate={onUpdate}
      />

      <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed Event Registration</DialogTitle>
            <DialogDescription>Copy this code to embed the event registration form on your website</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Public URL</Label>
              <div className="flex gap-2">
                <Input value={embedUrl} readOnly />
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(embedUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Embed Code</Label>
              <div className="flex gap-2">
                <Input value={embedCode} readOnly />
                <Button variant="outline" size="sm" onClick={copyEmbedCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
