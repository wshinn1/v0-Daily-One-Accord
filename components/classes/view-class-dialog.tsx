"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, MapPin, UserPlus, CheckCircle, QrCode, Table } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ClassQRCodeDialog } from "./class-qr-code-dialog"
import { ClassRosterView } from "./class-roster-view"

interface ViewClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classData: any
  churchTenantId: string
  members: any[]
}

export function ViewClassDialog({ open, onOpenChange, classData, churchTenantId, members }: ViewClassDialogProps) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [availableMembers, setAvailableMembers] = useState<any[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (open) {
      loadEnrollments()
    }
  }, [open, classData.id])

  const loadEnrollments = async () => {
    const { data } = await supabase
      .from("class_enrollments")
      .select("*, user:user_id(id, full_name, email, phone)")
      .eq("class_id", classData.id)

    if (data) {
      setEnrollments(data)
      const enrolledIds = data.map((e) => e.user_id)
      setAvailableMembers(members.filter((m) => !enrolledIds.includes(m.id)))
    }
  }

  const handleEnrollMembers = async () => {
    if (selectedMembers.length === 0) return

    setLoading(true)
    try {
      const enrollmentData = selectedMembers.map((userId) => ({
        class_id: classData.id,
        user_id: userId,
        status: "active",
      }))

      const { error } = await supabase.from("class_enrollments").insert(enrollmentData)

      if (!error) {
        await loadEnrollments()
        setSelectedMembers([])
      }
    } catch (error) {
      console.error("[v0] Error enrolling members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (enrollmentId: string) => {
    const { error } = await supabase.from("class_enrollments").delete().eq("id", enrollmentId)

    if (!error) {
      await loadEnrollments()
    }
  }

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{classData.name}</DialogTitle>
                {classData.category && <Badge className="mt-2">{classData.category}</Badge>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowQRDialog(true)}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
                <Badge variant={classData.is_active ? "default" : "secondary"}>
                  {classData.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="details" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="enrollments">Enrollments ({enrollments.length})</TabsTrigger>
                <TabsTrigger value="roster">
                  <Table className="h-4 w-4 mr-2" />
                  Roster
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-y-auto space-y-4">
                {classData.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{classData.description}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {classData.teacher && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Teacher</p>
                            <p className="font-medium">{classData.teacher.full_name}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {classData.schedule_day && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Schedule</p>
                            <p className="font-medium">
                              {classData.schedule_day} at {classData.schedule_time}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {classData.location && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-medium">{classData.location}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {classData.age_group && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Age Group</p>
                            <p className="font-medium">{classData.age_group}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="enrollments" className="flex-1 overflow-hidden flex flex-col space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Enroll Members</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-48 border rounded-lg p-2">
                      {availableMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={() => toggleMember(member.id)}
                          />
                          <label htmlFor={`member-${member.id}`} className="text-sm flex-1 cursor-pointer">
                            {member.full_name}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                    <Button
                      onClick={handleEnrollMembers}
                      disabled={selectedMembers.length === 0 || loading}
                      className="w-full"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Enroll {selectedMembers.length} Member{selectedMembers.length !== 1 ? "s" : ""}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="flex-1 overflow-hidden flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base">Enrolled Students ({enrollments.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      {enrollments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No students enrolled yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {enrollments.map((enrollment) => (
                            <div
                              key={enrollment.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium">{enrollment.user.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{enrollment.user.email}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleUnenroll(enrollment.id)}>
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roster" className="flex-1 overflow-hidden">
                <ClassRosterView enrollments={enrollments} classData={classData} churchTenantId={churchTenantId} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <ClassQRCodeDialog classData={classData} open={showQRDialog} onOpenChange={setShowQRDialog} />
    </>
  )
}
