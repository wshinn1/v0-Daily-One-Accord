"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, MapPin, Building2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Event {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  church_tenants: { name: string }
}

interface EventRegistrationFormProps {
  event: Event
}

export function EventRegistrationForm({ event }: EventRegistrationFormProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const supabase = getSupabaseBrowserClient()

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: insertError } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        ...formData,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({ full_name: "", email: "", phone: "", notes: "" })
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Building2 className="w-4 h-4" />
          {event.church_tenants.name}
        </div>
        <CardTitle className="text-2xl">{event.title}</CardTitle>
        <CardDescription className="space-y-2 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {startDate.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
            {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {event.description && <p className="text-sm text-muted-foreground mb-6">{event.description}</p>}

        {success ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Registration Successful!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for registering. You will receive a confirmation email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register for Event"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
