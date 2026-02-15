"use client"

import { useState, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GripVertical,
  Mail,
  Phone,
  Calendar,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Check,
  UserPlus,
  Clock,
  MessageSquare,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { EditVisitorDialog } from "./edit-visitor-dialog"
import { VisitorDetailModal } from "./visitor-detail-modal"
import { useToast } from "@/hooks/use-toast"

interface Visitor {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: "new" | "follow_up" | "engaged"
  notes: string | null
  first_visit_date: string | null
  assigned_to: { id: string; full_name: string } | null
  due_date: string | null
  labels?: Array<{ id: string; name: string; color: string }>
}

interface StaffMember {
  id: string
  full_name: string
}

interface VisitorCardProps {
  visitor: Visitor
  staffMembers: StaffMember[]
  onUpdate: (id: string, updates: Partial<Visitor>) => void
  onDelete: (id: string) => void
  currentUserId?: string
}

export function VisitorCard({ visitor, staffMembers, onUpdate, onDelete, currentUserId }: VisitorCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [commentCount, setCommentCount] = useState<number>(0)
  const { toast } = useToast()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: visitor.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? 1.05 : 1,
  }

  const copyToClipboard = async (text: string, type: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "email") {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else {
        setCopiedPhone(true)
        setTimeout(() => setCopiedPhone(false), 2000)
      }
      toast({
        title: "Copied!",
        description: `${type === "email" ? "Email" : "Phone number"} copied to clipboard`,
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleAssign = (memberId: string | null) => {
    onUpdate(visitor.id, { assigned_to: memberId } as any)
    toast({
      title: memberId ? "Visitor assigned" : "Visitor unassigned",
      description: memberId
        ? `Assigned to ${staffMembers.find((m) => m.id === memberId)?.full_name}`
        : "Assignment removed",
    })
  }

  const getDueDateStatus = () => {
    if (!visitor.due_date) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(visitor.due_date)
    dueDate.setHours(0, 0, 0, 0)

    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: "Overdue", color: "text-red-600 bg-red-50", days: Math.abs(diffDays) }
    if (diffDays === 0) return { label: "Due today", color: "text-orange-600 bg-orange-50", days: 0 }
    if (diffDays <= 3) return { label: `Due in ${diffDays}d`, color: "text-yellow-600 bg-yellow-50", days: diffDays }
    return { label: `Due in ${diffDays}d`, color: "text-muted-foreground bg-muted", days: diffDays }
  }

  const dueDateStatus = getDueDateStatus()

  const colorClasses = {
    red: "bg-red-100 text-red-800",
    orange: "bg-orange-100 text-orange-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    pink: "bg-pink-100 text-pink-800",
    gray: "bg-gray-100 text-gray-800",
  }

  const getPrimaryLabelColor = () => {
    if (!visitor.labels || visitor.labels.length === 0) return null
    const primaryLabel = visitor.labels[0]

    const borderColors = {
      red: "border-l-red-500",
      orange: "border-l-orange-500",
      yellow: "border-l-yellow-500",
      green: "border-l-green-500",
      blue: "border-l-blue-500",
      purple: "border-l-purple-500",
      pink: "border-l-pink-500",
      gray: "border-l-gray-500",
    }

    return borderColors[primaryLabel.color as keyof typeof borderColors] || null
  }

  const primaryLabelColor = getPrimaryLabelColor()

  useEffect(() => {
    loadCommentCount()
  }, [visitor.id])

  const loadCommentCount = async () => {
    try {
      const response = await fetch(`/api/visitors/${visitor.id}/comments`)
      const data = await response.json()
      if (response.ok && data.comments) {
        setCommentCount(data.comments.length)
      }
    } catch (error) {
      console.error("[v0] Error loading comment count:", error)
    }
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`cursor-move hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out hover:border-primary/50 border-l-4 bg-card/95 backdrop-blur-sm ${primaryLabelColor || "border-l-transparent"}`}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing mt-1 hover:text-primary transition-colors"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className="font-semibold text-sm truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsDetailModalOpen(true)}
                >
                  {visitor.full_name}
                </h4>
                {visitor.assigned_to ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-xs text-muted-foreground flex items-center gap-1 mt-1 hover:text-primary transition-colors">
                        <User className="w-3 h-3" />
                        {visitor.assigned_to.full_name}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Reassign to</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {staffMembers.map((member) => (
                        <DropdownMenuItem
                          key={member.id}
                          onClick={() => handleAssign(member.id)}
                          className={visitor.assigned_to?.id === member.id ? "bg-accent" : ""}
                        >
                          {member.full_name}
                          {visitor.assigned_to?.id === member.id && " ✓"}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAssign(null)} className="text-muted-foreground">
                        Unassign
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-xs text-muted-foreground flex items-center gap-1 mt-1 hover:text-primary transition-colors">
                        <UserPlus className="w-3 h-3" />
                        Assign member
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {staffMembers.map((member) => (
                        <DropdownMenuItem key={member.id} onClick={() => handleAssign(member.id)}>
                          {member.full_name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 relative hover:bg-primary/10 transition-colors"
                onClick={() => setIsDetailModalOpen(true)}
                title="View details and comments"
              >
                <MessageSquare className="w-4 h-4" />
                {commentCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {commentCount}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(visitor.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2">
          {dueDateStatus && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shadow-sm ${dueDateStatus.color}`}
            >
              <Clock className="w-3 h-3" />
              {dueDateStatus.label}
            </div>
          )}

          {visitor.labels && visitor.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visitor.labels.map((label) => (
                <Badge
                  key={label.id}
                  className={`text-xs shadow-sm ${colorClasses[label.color as keyof typeof colorClasses] || colorClasses.gray}`}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}

          {visitor.email && (
            <div className="flex items-center justify-between gap-2 group">
              <p className="text-xs flex items-center gap-2 text-muted-foreground flex-1 min-w-0">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{visitor.email}</span>
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                onClick={() => copyToClipboard(visitor.email!, "email")}
              >
                {copiedEmail ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          )}
          {visitor.phone && (
            <div className="flex items-center justify-between gap-2 group">
              <p className="text-xs flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3 h-3 flex-shrink-0" />
                {visitor.phone}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                onClick={() => copyToClipboard(visitor.phone!, "phone")}
              >
                {copiedPhone ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          )}
          {visitor.first_visit_date && (
            <p className="text-xs flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(visitor.first_visit_date).toLocaleDateString()}
            </p>
          )}
          {visitor.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{visitor.notes}</p>}
        </CardContent>
      </Card>

      <EditVisitorDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        visitor={visitor}
        staffMembers={staffMembers}
        onUpdate={onUpdate}
      />

      {currentUserId && (
        <VisitorDetailModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          visitor={visitor}
          currentUserId={currentUserId}
          onVisitorUpdate={() => loadCommentCount()}
        />
      )}
    </>
  )
}
