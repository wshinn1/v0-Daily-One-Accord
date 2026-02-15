"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "@/lib/utils/date-helpers"
import { Loader2, Send, Trash2, Edit2 } from "lucide-react"

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  user: {
    id: string
    full_name: string
    email: string
  }
}

interface CardCommentsProps {
  cardId: string
  currentUserId: string
}

export function CardComments({ cardId, currentUserId }: CardCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [cardId])

  const fetchComments = async () => {
    try {
      console.log("[v0] Fetching comments for card:", cardId)
      const response = await fetch(`/api/kanban/cards/${cardId}/comments`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Comments loaded:", data.length)
        setComments(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      console.log("[v0] Submitting new comment")
      const response = await fetch(`/api/kanban/cards/${cardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        const comment = await response.json()
        console.log("[v0] Comment created:", comment.id)
        setComments([...comments, comment])
        setNewComment("")
      }
    } catch (error) {
      console.error("[v0] Error creating comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      console.log("[v0] Updating comment:", commentId)
      const response = await fetch(`/api/kanban/cards/${cardId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        const updated = await response.json()
        console.log("[v0] Comment updated")
        setComments(comments.map((c) => (c.id === commentId ? updated : c)))
        setEditingId(null)
        setEditContent("")
      }
    } catch (error) {
      console.error("[v0] Error updating comment:", error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return

    try {
      console.log("[v0] Deleting comment:", commentId)
      const response = await fetch(`/api/kanban/cards/${cardId}/comments/${commentId}`, { method: "DELETE" })

      if (response.ok) {
        console.log("[v0] Comment deleted")
        setComments(comments.filter((c) => c.id !== commentId))
      }
    } catch (error) {
      console.error("[v0] Error deleting comment:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comment List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {comment.user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user.full_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at))}
                </span>
              </div>
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(comment.id)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setEditContent("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                  {comment.user.id === currentUserId && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditContent(comment.content)
                        }}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(comment.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[80px]"
          disabled={submitting}
        />
        <Button type="submit" disabled={submitting || !newComment.trim()}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          Comment
        </Button>
      </form>
    </div>
  )
}
