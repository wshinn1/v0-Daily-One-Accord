"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageSquare, Phone } from "lucide-react"

interface SmsSettingsCardProps {
  churchTenantId: string
}

export function SmsSettingsCard({ churchTenantId }: SmsSettingsCardProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [messagingProfileId, setMessagingProfileId] = useState("")
  const [enabled, setEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/church-tenants/${churchTenantId}/sms-settings`)
        if (response.ok) {
          const data = await response.json()
          setPhoneNumber(data.sms_phone_number || "")
          setMessagingProfileId(data.sms_messaging_profile_id || "")
          setEnabled(data.sms_enabled || false)
        }
      } catch (error) {
        console.error("[v0] Error fetching SMS settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [churchTenantId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/church-tenants/${churchTenantId}/sms-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sms_phone_number: phoneNumber,
          sms_messaging_profile_id: messagingProfileId,
          sms_enabled: enabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save SMS settings")
      }

      toast({
        title: "Settings saved",
        description: "SMS configuration has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">SMS Configuration</h3>
          <p className="text-sm text-muted-foreground">Configure Telnyx SMS for visitor follow-ups and notifications</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable SMS</Label>
            <p className="text-sm text-muted-foreground">Allow sending SMS messages from this church</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone-number">
            <Phone className="h-4 w-4 inline mr-2" />
            Telnyx Phone Number
          </Label>
          <Input
            id="phone-number"
            placeholder="+12345678900"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!enabled}
          />
          <p className="text-xs text-muted-foreground">Your Telnyx phone number in E.164 format (e.g., +12345678900)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="messaging-profile">Messaging Profile ID (Optional)</Label>
          <Input
            id="messaging-profile"
            placeholder="40000000-0000-0000-0000-000000000000"
            value={messagingProfileId}
            onChange={(e) => setMessagingProfileId(e.target.value)}
            disabled={!enabled}
          />
          <p className="text-xs text-muted-foreground">
            Optional: Your Telnyx messaging profile ID for advanced routing
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving || !enabled}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save SMS Settings
        </Button>
      </div>
    </Card>
  )
}

export { SmsSettingsCard as SMSSettingsCard }
