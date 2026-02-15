"use client"

import type React from "react"
import type { JSX } from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  comment_text: string
  created_at: string
  user: {
    id: string
    full_name: string
  }
}

interface TeamMember {
  id: string
  full_name: string
  email: string
}

interface VisitorCommentsProps {
  visitorId: string
  currentUserId: string
  onCommentAdded?: () => void
}

export function VisitorComments({ visitorId, currentUserId, onCommentAdded }: VisitorCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionPosition, setMentionPosition] = useState(0)
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadComments()
    loadTeamMembers()
  }, [visitorId])

  useEffect(() => {
    if (mentionSearch) {
      const filtered = teamMembers.filter((member) =>
        member.full_name.toLowerCase().includes(mentionSearch.toLowerCase()),
      )
      setFilteredMembers(filtered)
      setSelectedMentionIndex(0)
    }
  }, [mentionSearch, teamMembers])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/comments`)
      const data = await response.json()

      if (response.ok) {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTeamMembers = async () => {
    try {
      const response = await fetch("/api/team-members")
      const data = await response.json()

      if (response.ok) {
        setTeamMembers(data.teamMembers || [])
      }
    } catch (error) {
      console.error("Error loading team members:", error)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart

    setNewComment(value)

    const textBeforeCursor = value.slice(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
      const hasSpace = textAfterAt.includes(" ")

      if (!hasSpace) {
        setShowMentions(true)
        setMentionSearch(textAfterAt)
        setMentionPosition(lastAtIndex)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (member: TeamMember) => {
    const beforeMention = newComment.slice(0, mentionPosition)
    const afterMention = newComment.slice(textareaRef.current?.selectionStart || mentionPosition)

    // Store the full mention format with ID for backend processing
    const mentionText = `@[${member.full_name}](${member.id}) `
    const newText = beforeMention + mentionText + afterMention

    setNewComment(newText)
    setShowMentions(false)
    setMentionSearch("")

    setTimeout(() => {
      textareaRef.current?.focus()
      const newPosition = beforeMention.length + mentionText.length
      textareaRef.current?.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev + 1) % filteredMembers.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        insertMention(filteredMembers[selectedMentionIndex])
      } else if (e.key === "Escape") {
        setShowMentions(false)
      }
    }
  }

  const renderCommentText = (text: string) => {
    const parts: (string | JSX.Element)[] = []
    let currentIndex = 0
    let keyCounter = 0

    while (currentIndex < text.length) {
      const mentionStart = text.indexOf("@[", currentIndex)

      if (mentionStart === -1) {
        parts.push(text.slice(currentIndex))
        break
      }

      if (mentionStart > currentIndex) {
        parts.push(text.slice(currentIndex, mentionStart))
      }

      const nameEnd = text.indexOf("](", mentionStart + 2)
      if (nameEnd === -1) {
        parts.push(text.slice(currentIndex))
        break
      }

      const idEnd = text.indexOf(")", nameEnd + 2)
      if (idEnd === -1) {
        parts.push(text.slice(currentIndex))
        break
      }

      const userName = text.substring(mentionStart + 2, nameEnd)

      parts.push(
        <span key={`mention-${keyCounter++}`} className="text-blue-600 font-medium">
          @{userName}
        </span>,
      )

      currentIndex = idEnd + 1
    }

    return parts.length > 0 ? parts : text
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      console.log("[v0 CLIENT] Submitting comment:", newComment)

      const response = await fetch(`/api/visitors/${visitorId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: newComment }),
      })

      const data = await response.json()
      console.log("[v0 CLIENT] Comment API response:", data)

      if (response.ok) {
        setComments([...comments, data.comment])
        setNewComment("")
        if (onCommentAdded) {
          onCommentAdded()
        }
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully",
        })
      } else {
        toast({
          title: "Failed to add comment",
          description: data.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0 CLIENT] Error submitting comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId))
        toast({
          title: "Comment deleted",
          description: "Your comment has been removed",
        })
      } else {
        toast({
          title: "Failed to delete comment",
          description: "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const displayTextWithoutUUIDs = (text: string) => {
    // Replace @[Name](uuid) with just @Name for display
    // Using string-based approach instead of regex for reliability
    let result = text
    let searchIndex = 0

    while (searchIndex < result.length) {
      const mentionStart = result.indexOf("@[", searchIndex)
      if (mentionStart === -1) break

      const nameEnd = result.indexOf("](", mentionStart + 2)
      if (nameEnd === -1) break

      const idEnd = result.indexOf(")", nameEnd + 2)
      if (idEnd === -1) break

      const name = result.substring(mentionStart + 2, nameEnd)
      const beforeMention = result.substring(0, mentionStart)
      const afterMention = result.substring(idEnd + 1)

      result = beforeMention + "@" + name + afterMention
      searchIndex = mentionStart + name.length + 1
    }

    return result
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading comments...</div>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs">{getInitials(comment.user.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{comment.user.full_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                  {comment.user.id === currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {renderCommentText(comment.comment_text)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 relative">
        <Textarea
          ref={textareaRef}
          value={newComment}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment... (Type @ to mention someone)"
          rows={3}
          disabled={isSubmitting}
        />

        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full mb-2 w-full bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
            {filteredMembers.map((member, index) => (
              <button
                key={member.id}
                type="button"
                className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors ${
                  index === selectedMentionIndex ? "bg-accent" : ""
                }`}
                onClick={() => insertMention(member)}
              >
                <div className="font-medium text-sm">{member.full_name}</div>
                <div className="text-xs text-muted-foreground">{member.email}</div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Type @ to mention team members</p>
          <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>
    </div>
  )
}
