"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileIcon, Trash2, Upload, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Attachment {
  id: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  created_at: string
  user: {
    id: string
    full_name: string
  }
}

interface VisitorAttachmentsProps {
  visitorId: string
  currentUserId: string
}

export function VisitorAttachments({ visitorId, currentUserId }: VisitorAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAttachments()
  }, [visitorId])

  const loadAttachments = async () => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/attachments`)
      const data = await response.json()

      if (response.ok) {
        setAttachments(data.attachments || [])
      } else {
        console.error("[v0] Error loading attachments:", data.error)
      }
    } catch (error) {
      console.error("[v0] Exception loading attachments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/visitors/${visitorId}/attachments`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setAttachments([data.attachment, ...attachments])
        toast({
          title: "File uploaded",
          description: "Your file has been attached successfully",
        })
      } else {
        toast({
          title: "Upload failed",
          description: data.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Exception uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/attachments/${attachmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAttachments(attachments.filter((a) => a.id !== attachmentId))
        toast({
          title: "File deleted",
          description: "The attachment has been removed",
        })
      } else {
        toast({
          title: "Failed to delete file",
          description: "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Exception deleting attachment:", error)
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️"
    if (fileType.startsWith("video/")) return "🎥"
    if (fileType.startsWith("audio/")) return "🎵"
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word") || fileType.includes("document")) return "📝"
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊"
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📽️"
    if (fileType.includes("zip") || fileType.includes("rar")) return "🗜️"
    return "📎"
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading attachments...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Attachments ({attachments.length})</h4>
        <div>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" disabled={isUploading} />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </div>
      </div>

      {attachments.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <FileIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No attachments yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload files to share with your team</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="text-2xl flex-shrink-0">{getFileIcon(attachment.file_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file_size)} • {attachment.user.full_name} •{" "}
                  {formatDate(attachment.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                  <a
                    href={attachment.file_url}
                    download={attachment.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
                {attachment.user.id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
    </div>
  )
}
