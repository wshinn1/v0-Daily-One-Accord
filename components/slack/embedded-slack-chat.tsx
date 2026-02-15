"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, X, MessageSquare, Volume2, VolumeX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define types for clarity and to resolve undeclared variables
interface Channel {
  id: string
  name: string
  // Add other relevant channel properties as needed
}

interface Message {
  id: string
  user: string
  text: string
  ts: string
  // Add other relevant message properties as needed
}

interface SlackUser {
  id: string
  name: string
  // Add other relevant user properties as needed
}

interface EmbeddedSlackChatProps {
  tenantId: string
  isConfigured: boolean
  userName: string
}

function convertSlackEmojis(text: string): string {
  const emojiMap: Record<string, string> = {
    speech_balloon: "💬",
    arrows_counterclockwise: "🔄",
    bell: "🔔",
    white_check_mark: "✅",
    warning: "⚠️",
    x: "❌",
    eyes: "👀",
    wave: "👋",
    pray: "🙏",
    heart: "❤️",
    fire: "🔥",
    star: "⭐",
    tada: "🎉",
  }

  return text.replace(/:([a-z_]+):/g, (match, emojiName) => {
    return emojiMap[emojiName] || match
  })
}

function parseSlackMessage(text: string): { userName: string; message: string } | null {
  const cleanText = text.replace(/@\[([^\]]+)\]$$([^)]+)$$/g, "@$1")

  // Try to parse visitor comment mention format
  const commentMatch = cleanText.match(/\*By:\*\s*([^\n]+)\n\*Mentioned:\*[^\n]+\n\n\*Comment:\*\n(.+)/s)
  if (commentMatch) {
    return {
      userName: commentMatch[1].trim(),
      message: convertSlackEmojis(commentMatch[2].trim()),
    }
  }

  // Try to parse visitor status change format
  const statusMatch = cleanText.match(/\*Visitor Status Changed\*/)
  if (statusMatch) {
    return {
      userName: "System",
      message: convertSlackEmojis(cleanText),
    }
  }

  // Default: return cleaned text
  return null
}

function formatSlackTimestamp(timestamp: string | undefined): string {
  if (!timestamp) {
    console.error("[v0] Invalid timestamp: undefined")
    return "Unknown time"
  }

  let date: Date

  const unixTimestamp = Number.parseFloat(timestamp)
  if (!isNaN(unixTimestamp)) {
    date = new Date(unixTimestamp * 1000)
  } else {
    date = new Date(timestamp)
  }

  if (isNaN(date.getTime())) {
    console.error("[v0] Invalid timestamp:", timestamp)
    return "Unknown time"
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return "Just now"
  } else if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
}

export function EmbeddedSlackChat({ tenantId, isConfigured, userName }: EmbeddedSlackChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [userMap, setUserMap] = useState<Record<string, SlackUser>>({})
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isSoundMuted, setIsSoundMuted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousMessageCountRef = useRef<number>(0)

  useEffect(() => {
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }

    audioRef.current = { play: createNotificationSound } as any
  }, [])

  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id)
    }
  }, [channels, selectedChannel])

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages()
      pollingIntervalRef.current = setInterval(fetchMessages, 5000)
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    }
  }, [selectedChannel])

  useEffect(() => {
    if (messages.length > previousMessageCountRef.current && previousMessageCountRef.current > 0 && !isSoundMuted) {
      const latestMessage = messages[messages.length - 1]
      const currentUserName = userName.toLowerCase()
      const messageUserName = (userMap[latestMessage.user]?.name || "").toLowerCase()

      if (messageUserName !== currentUserName && audioRef.current) {
        try {
          audioRef.current.play()
        } catch (error) {
          console.error("[v0] Failed to play notification sound:", error)
        }
      }
    }
    previousMessageCountRef.current = messages.length
  }, [messages, userMap, userName, isSoundMuted])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/slack/channels?tenantId=${tenantId}`)
      const data = await response.json()
      if (data.channels) {
        setChannels(data.channels)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch channels:", error)
    }
  }

  const fetchUsers = async (userIds: string[]) => {
    if (userIds.length === 0) return

    try {
      const response = await fetch(`/api/slack/users?tenantId=${tenantId}&userIds=${userIds.join(",")}`)
      const data = await response.json()
      if (data.users) {
        setUserMap((prev) => ({ ...prev, ...data.users }))
      }
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
    }
  }

  const fetchMessages = async () => {
    if (!selectedChannel) return

    try {
      const response = await fetch(`/api/slack/messages?tenantId=${tenantId}&channelId=${selectedChannel}`)
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
        const userIds = [...new Set(data.messages.map((msg: Message) => msg.user))]
        const missingUserIds = userIds.filter((id) => !userMap[id])
        if (missingUserIds.length > 0) {
          fetchUsers(missingUserIds)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch messages:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || sending) return

    setSending(true)
    try {
      const response = await fetch("/api/slack/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          channelId: selectedChannel,
          text: newMessage,
          userName,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("[v0] Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedChannel || uploading) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("tenantId", tenantId)
      formData.append("channelId", selectedChannel)

      const response = await fetch("/api/slack/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setSelectedFile(null)
        fetchMessages()
      }
    } catch (error) {
      console.error("[v0] Failed to upload file:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  if (!isConfigured) {
    return null
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => {
          setIsOpen(true)
          fetchChannels()
        }}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg"
        size="icon"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Slack Chat</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            title={isSoundMuted ? "Unmute notifications" : "Mute notifications"}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0 gap-3 min-h-0">
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger>
            <SelectValue placeholder="Select a channel" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                #{channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ScrollArea
          ref={scrollRef}
          className={`flex-1 min-h-0 pr-4 ${isDragging ? "border-2 border-dashed border-primary" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {messages.map((message) => {
              const parsed = parseSlackMessage(message.text)
              const displayName =
                parsed?.userName ||
                userMap[message.user]?.name ||
                (message.user?.startsWith("B") ? "Dream Church App" : "Unknown")
              const displayMessage =
                parsed?.message || convertSlackEmojis(message.text.replace(/@\[([^\]]+)\]$$([^)]+)$$/g, "@$1"))

              return (
                <div key={message.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {displayName}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatSlackTimestamp(message.ts)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{displayMessage}</p>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {selectedFile && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <Paperclip className="w-4 h-4" />
            <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleFileUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0])
              }
            }}
          />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
