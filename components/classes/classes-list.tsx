"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Users, Calendar, MapPin, QrCode } from "lucide-react"
import { ViewClassDialog } from "./view-class-dialog"
import { ClassQRCodeDialog } from "./class-qr-code-dialog"

interface ClassesListProps {
  classes: any[]
  onDelete: (id: string) => void
  churchTenantId: string
  members: any[]
}

export function ClassesList({ classes, onDelete, churchTenantId, members }: ClassesListProps) {
  const [viewingClass, setViewingClass] = useState<any>(null)
  const [qrCodeClass, setQrCodeClass] = useState<any>(null)

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
          <p className="text-sm text-muted-foreground">Create your first class to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg truncate">{classItem.name}</CardTitle>
                  {classItem.category && (
                    <Badge variant="secondary" className="mt-2">
                      {classItem.category}
                    </Badge>
                  )}
                </div>
                <Badge variant={classItem.is_active ? "default" : "secondary"}>
                  {classItem.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {classItem.teacher && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {classItem.teacher.full_name}
                </div>
              )}
              {classItem.is_recurring && classItem.recurrence_days?.length > 0 ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {classItem.recurrence_days.join(", ")} at {classItem.schedule_time}
                </div>
              ) : classItem.schedule_day ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {classItem.schedule_day} at {classItem.schedule_time}
                </div>
              ) : null}
              {classItem.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {classItem.location}
                </div>
              )}
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4" />
                <span className="font-medium">{classItem.class_enrollments?.length || 0} enrolled</span>
                {classItem.max_capacity && (
                  <span className="text-muted-foreground ml-1">/ {classItem.max_capacity}</span>
                )}
              </div>
              {classItem.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{classItem.description}</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => setViewingClass(classItem)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQrCodeClass(classItem)} title="View QR Code">
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(classItem.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {viewingClass && (
        <ViewClassDialog
          open={!!viewingClass}
          onOpenChange={(open) => !open && setViewingClass(null)}
          classData={viewingClass}
          churchTenantId={churchTenantId}
          members={members}
        />
      )}

      {qrCodeClass && (
        <ClassQRCodeDialog
          classData={qrCodeClass}
          open={!!qrCodeClass}
          onOpenChange={(open) => !open && setQrCodeClass(null)}
        />
      )}
    </>
  )
}
