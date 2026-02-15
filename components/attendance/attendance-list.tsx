"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, Trash2 } from "lucide-react"

interface AttendanceRecord {
  id: string
  event: { title: string; start_time: string }
  user: { full_name: string }
  attended_at: string
  notes: string | null
}

interface AttendanceListProps {
  attendance: AttendanceRecord[]
  onDelete: (id: string) => void
}

export function AttendanceList({ attendance, onDelete }: AttendanceListProps) {
  if (attendance.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No attendance records yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {attendance.map((record) => (
        <Card key={record.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{record.event.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {record.user.full_name}
                </div>
                <p className="text-xs text-muted-foreground">
                  Attended: {new Date(record.attended_at).toLocaleString()}
                </p>
                {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onDelete(record.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
