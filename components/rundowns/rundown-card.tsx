"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"

interface RundownCardProps {
  rundown: any
  onClick: () => void
}

export function RundownCard({ rundown, onClick }: RundownCardProps) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{rundown.title}</CardTitle>
          {rundown.is_published && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Published
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          {format(new Date(rundown.event_date), "MMMM d, yyyy")}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          {rundown.event_type.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </div>
        {rundown.added_to_calendar && (
          <Badge variant="outline" className="mt-2">
            Added to Calendar
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
