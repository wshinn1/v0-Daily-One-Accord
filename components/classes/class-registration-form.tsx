"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, MapPin, Users, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClassRegistrationFormProps {
  classData: any
  isRegistrationOpen: boolean
}

export function ClassRegistrationForm({ classData, isRegistrationOpen }: ClassRegistrationFormProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    studentAge: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/classes/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: classData.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Registration failed")
      }

      setIsSuccess(true)
      toast({
        title: "Registration Successful!",
        description: "You will receive a confirmation email shortly.",
      })
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
        <p className="text-muted-foreground mb-6">
          Thank you for registering for {classData.name}. You will receive a confirmation email shortly with more
          details.
        </p>
        <Button onClick={() => window.location.reload()}>Register Another Student</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
          <p className="text-lg text-muted-foreground">{classData.church_tenants.name}</p>
        </div>

        {classData.description && <p className="text-muted-foreground mb-6">{classData.description}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classData.schedule && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>{classData.schedule}</span>
            </div>
          )}
          {classData.time && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span>{classData.time}</span>
            </div>
          )}
          {classData.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <span>{classData.location}</span>
            </div>
          )}
          {classData.age_group && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span>{classData.age_group}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Registration Form */}
      {!isRegistrationOpen ? (
        <Card className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Registration Not Available</h3>
          <p className="text-muted-foreground">
            Registration for this class is currently closed. Please check back later or contact the church for more
            information.
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Register for This Class</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="studentName">Student Name *</Label>
              <Input
                id="studentName"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="studentAge">Student Age</Label>
              <Input
                id="studentAge"
                type="number"
                value={formData.studentAge}
                onChange={(e) => setFormData({ ...formData, studentAge: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="parentName">Parent/Guardian Name *</Label>
              <Input
                id="parentName"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="parentEmail">Parent/Guardian Email *</Label>
              <Input
                id="parentEmail"
                type="email"
                required
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
              <Input
                id="parentPhone"
                type="tel"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any allergies, special needs, or questions..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Complete Registration"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
