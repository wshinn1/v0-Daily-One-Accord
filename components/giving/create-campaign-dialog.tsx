"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  churchTenantId: string
  onSuccess: () => void
}

export function CreateCampaignDialog({ open, onOpenChange, churchTenantId, onSuccess }: CreateCampaignDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal_amount: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    image_url: "",
    thank_you_message: "",
  })
  const { toast } = useToast()
  const supabase = createBrowserClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const goalAmountCents = Math.round(Number.parseFloat(formData.goal_amount) * 100)

      if (isNaN(goalAmountCents) || goalAmountCents <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid goal amount",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const { error } = await supabase.from("giving_campaigns").insert({
        church_tenant_id: churchTenantId,
        name: formData.name,
        description: formData.description || null,
        goal_amount: goalAmountCents,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        image_url: formData.image_url || null,
        thank_you_message: formData.thank_you_message || null,
        is_active: true,
      })

      if (error) throw error

      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully",
      })

      onSuccess()
      onOpenChange(false)
      setFormData({
        name: "",
        description: "",
        goal_amount: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        image_url: "",
        thank_you_message: "",
      })
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>Create a new fundraising campaign with a specific goal and timeline</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Building Fund 2025"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Help us build our new worship center..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal_amount">Goal Amount ($) *</Label>
            <Input
              id="goal_amount"
              type="number"
              step="0.01"
              min="1"
              value={formData.goal_amount}
              onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
              placeholder="50000.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/campaign-image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thank_you_message">Thank You Message (Optional)</Label>
            <Textarea
              id="thank_you_message"
              value={formData.thank_you_message}
              onChange={(e) => setFormData({ ...formData, thank_you_message: e.target.value })}
              placeholder="Thank you for your generous contribution to our building fund!"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
