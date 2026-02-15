"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "@/lib/utils/date-helpers"
import { Loader2, MessageSquare, Move, UserPlus, Edit, Archive } from "lucide-react"

interface Activity {
  id: string
  activity_type: string
  activity_data: any
  created_at: string
  user: {
    id: string
    full_name: string
    email: string
  }
}

interface CardActivityFeedProps {
  cardId: string
}

export function CardActivityFeed({ cardId }: CardActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [cardId])

  const fetchActivities = async () => {
    try {
      console.log("[v0] Fetching activities for card:", cardId)
      const response = await fetch(`/api/kanban/cards/${cardId}/activities`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Activities loaded:", data.length)
        setActivities(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "commented":
        return <MessageSquare className="h-4 w-4" />
      case "moved":
        return <Move className="h-4 w-4" />
      case "assigned":
        return <UserPlus className="h-4 w-4" />
      case "updated":
        return <Edit className="h-4 w-4" />
      case "archived":
        return <Archive className="h-4 w-4" />
      default:
        return <Edit className="h-4 w-4" />
    }
  }

  const getActivityText = (activity: Activity) => {
    const { activity_type, activity_data } = activity
    switch (activity_type) {
      case "commented":
        return "added a comment"
      case "moved":
        return `moved this card to ${activity_data.new_column || "another column"}`
      case "assigned":
        return `assigned this to ${activity_data.assignee_name || "someone"}`
      case "updated":
        return "updated this card"
      case "archived":
        return "archived this card"
      case "created":
        return "created this card"
      default:
        return activity_type
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
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {activity.user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{activity.user.full_name}</span>
              <span className="text-sm text-muted-foreground">{getActivityText(activity)}</span>
            </div>
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(activity.created_at))}</span>
          </div>
          <div className="text-muted-foreground">{getActivityIcon(activity.activity_type)}</div>
        </div>
      ))}
      {activities.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>}
    </div>
  )
}
