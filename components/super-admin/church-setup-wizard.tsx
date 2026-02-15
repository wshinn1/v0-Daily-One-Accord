"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Palette,
  Key,
  UserCircle,
  MessageSquare,
  HardDrive,
  Phone,
  Users,
  Video,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ChurchThemeEditorDialog } from "./church-theme-editor-dialog"
import { AssignLeadAdminDialog } from "./assign-lead-admin-dialog"
import { SlackBotSetup } from "@/components/slack/slack-bot-setup"
import { GroupMeSetup } from "@/components/groupme/groupme-setup"
import { ZoomSetup } from "@/components/zoom/zoom-setup"

interface ChurchSetupWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  churchId: string
  churchName: string
  onSetupComplete: () => void
}

interface SetupStep {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  required: boolean
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: "lead_admin",
    name: "Lead Administrator",
    description: "Assign a lead administrator for this church",
    icon: <UserCircle className="w-5 h-5" />,
    required: true,
  },
  {
    id: "access_code",
    name: "Access Code",
    description: "Set a unique access code for member registration",
    icon: <Key className="w-5 h-5" />,
    required: true,
  },
  {
    id: "branding",
    name: "Branding & Theme",
    description: "Customize colors, fonts, and logo",
    icon: <Palette className="w-5 h-5" />,
    required: false,
  },
  {
    id: "slack",
    name: "Slack Integration",
    description: "Connect Slack workspace and configure bot",
    icon: <MessageSquare className="w-5 h-5" />,
    required: false,
  },
  {
    id: "groupme",
    name: "GroupMe Integration",
    description: "Connect GroupMe for message bridging",
    icon: <Users className="w-5 h-5" />,
    required: false,
  },
  {
    id: "zoom",
    name: "Zoom Integration",
    description: "Connect Zoom for virtual meetings",
    icon: <Video className="w-5 h-5" />,
    required: false,
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Configure Google Drive API for media assets",
    icon: <HardDrive className="w-5 h-5" />,
    required: false,
  },
  {
    id: "sms",
    name: "SMS Notifications",
    description: "Set up Telnyx for SMS messaging",
    icon: <Phone className="w-5 h-5" />,
    required: false,
  },
]

export function ChurchSetupWizard({
  open,
  onOpenChange,
  churchId,
  churchName,
  onSetupComplete,
}: ChurchSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [setupStatus, setSetupStatus] = useState<Record<string, boolean>>({})
  const supabase = getSupabaseBrowserClient()

  // Step-specific states
  const [leadAdminDialogOpen, setLeadAdminDialogOpen] = useState(false)
  const [themeEditorOpen, setThemeEditorOpen] = useState(false)
  const [slackBotDialogOpen, setSlackBotDialogOpen] = useState(false)
  const [groupMeDialogOpen, setGroupMeDialogOpen] = useState(false)
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    access_code: "",
    google_drive_api_key: "",
    groupme_access_token: "",
    zoom_account_id: "",
    zoom_client_id: "",
    zoom_client_secret: "",
  })

  const completedSteps = Object.values(setupStatus).filter(Boolean).length
  const requiredSteps = SETUP_STEPS.filter((s) => s.required)
  const completedRequiredSteps = requiredSteps.filter((s) => setupStatus[s.id]).length
  const progressPercentage = (completedSteps / SETUP_STEPS.length) * 100

  useEffect(() => {
    if (open) {
      loadSetupStatus()
    }
  }, [open, churchId])

  const loadSetupStatus = async () => {
    try {
      const response = await fetch(`/api/church-tenants/${churchId}/setup-status`)
      const status = await response.json()
      setSetupStatus(status)

      // Load existing data
      const { data: church } = await supabase.from("church_tenants").select("*").eq("id", churchId).single()

      if (church) {
        setFormData({
          access_code: church.church_code || "",
          google_drive_api_key: "",
          groupme_access_token: "",
          zoom_account_id: "",
          zoom_client_id: "",
          zoom_client_secret: "",
        })
      }
    } catch (error) {
      console.error("[v0] Error loading setup status:", error)
    }
  }

  const handleSaveAccessCode = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("church_tenants")
        .update({ church_code: formData.access_code })
        .eq("id", churchId)

      if (error) throw error

      setSetupStatus((prev) => ({ ...prev, access_code: true }))
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error("[v0] Error saving access code:", error)
      alert("Failed to save access code")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGoogleDrive = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("church_tenants")
        .update({ google_drive_api_key: formData.google_drive_api_key })
        .eq("id", churchId)

      if (error) throw error

      setSetupStatus((prev) => ({ ...prev, google_drive: true }))
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error("[v0] Error saving Google Drive API key:", error)
      alert("Failed to save Google Drive API key")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGroupMe = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("church_tenants")
        .update({ groupme_access_token: formData.groupme_access_token })
        .eq("id", churchId)

      if (error) throw error

      setSetupStatus((prev) => ({ ...prev, groupme: true }))
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error("[v0] Error saving GroupMe access token:", error)
      alert("Failed to save GroupMe access token")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveZoom = async () => {
    setLoading(true)
    try {
      // Check if Zoom integration already exists
      const { data: existingZoom } = await supabase
        .from("zoom_integrations")
        .select("id")
        .eq("church_tenant_id", churchId)
        .single()

      if (existingZoom) {
        // Update existing
        const { error } = await supabase
          .from("zoom_integrations")
          .update({
            account_id: formData.zoom_account_id,
            client_id: formData.zoom_client_id,
            client_secret: formData.zoom_client_secret,
            is_active: true,
          })
          .eq("id", existingZoom.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase.from("zoom_integrations").insert({
          church_tenant_id: churchId,
          account_id: formData.zoom_account_id,
          client_id: formData.zoom_client_id,
          client_secret: formData.zoom_client_secret,
          is_active: true,
        })

        if (error) throw error
      }

      setSetupStatus((prev) => ({ ...prev, zoom: true }))
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error("[v0] Error saving Zoom credentials:", error)
      alert("Failed to save Zoom credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    onSetupComplete()
    onOpenChange(false)
  }

  const renderStepContent = () => {
    const step = SETUP_STEPS[currentStep]

    switch (step.id) {
      case "lead_admin":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The Lead Administrator will have full control over this church's settings and can manage other users.
              </AlertDescription>
            </Alert>
            <Button onClick={() => setLeadAdminDialogOpen(true)} className="w-full">
              <UserCircle className="w-4 h-4 mr-2" />
              {setupStatus.lead_admin ? "Change Lead Admin" : "Assign Lead Admin"}
            </Button>
            {setupStatus.lead_admin && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Lead admin assigned
              </div>
            )}
          </div>
        )

      case "access_code":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Members will use this code to register and join your church. Make it memorable and unique.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="access_code">
                Access Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="access_code"
                value={formData.access_code}
                onChange={(e) => setFormData((prev) => ({ ...prev, access_code: e.target.value }))}
                placeholder="e.g., DREAMCHURCH2025"
              />
              <p className="text-xs text-muted-foreground">Use letters and numbers only, no spaces</p>
            </div>
            <Button onClick={handleSaveAccessCode} disabled={loading || !formData.access_code} className="w-full">
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        )

      case "branding":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Customize your church's appearance with colors, fonts, and logo.</AlertDescription>
            </Alert>
            <Button onClick={() => setThemeEditorOpen(true)} className="w-full">
              <Palette className="w-4 h-4 mr-2" />
              Open Theme Editor
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep(currentStep + 1)} className="w-full">
              Skip for Now
            </Button>
          </div>
        )

      case "slack":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your Slack workspace to enable attendance tracking, rundown publishing, and team communication.
              </AlertDescription>
            </Alert>
            <Button onClick={() => setSlackBotDialogOpen(true)} className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Configure Slack Bot
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep(currentStep + 1)} className="w-full">
              Skip for Now
            </Button>
          </div>
        )

      case "groupme":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect GroupMe to bridge messages between Slack and GroupMe groups. Get your access token from
                dev.groupme.com.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="groupme_access_token">GroupMe Access Token</Label>
              <Input
                id="groupme_access_token"
                type="password"
                value={formData.groupme_access_token}
                onChange={(e) => setFormData((prev) => ({ ...prev, groupme_access_token: e.target.value }))}
                placeholder="Enter access token from dev.groupme.com"
              />
              <p className="text-xs text-muted-foreground">
                Log in to dev.groupme.com and copy your access token from the top right
              </p>
            </div>
            <Button onClick={handleSaveGroupMe} disabled={loading || !formData.groupme_access_token} className="w-full">
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep(currentStep + 1)} className="w-full">
              Skip for Now
            </Button>
          </div>
        )

      case "zoom":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect Zoom to create meetings from Slack. You'll need Server-to-Server OAuth credentials from
                marketplace.zoom.us.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoom_account_id">Zoom Account ID</Label>
                <Input
                  id="zoom_account_id"
                  value={formData.zoom_account_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zoom_account_id: e.target.value }))}
                  placeholder="Enter Account ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoom_client_id">Client ID</Label>
                <Input
                  id="zoom_client_id"
                  value={formData.zoom_client_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zoom_client_id: e.target.value }))}
                  placeholder="Enter Client ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoom_client_secret">Client Secret</Label>
                <Input
                  id="zoom_client_secret"
                  type="password"
                  value={formData.zoom_client_secret}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zoom_client_secret: e.target.value }))}
                  placeholder="Enter Client Secret"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Create a Server-to-Server OAuth app at marketplace.zoom.us/develop/create
              </p>
            </div>
            <Button
              onClick={handleSaveZoom}
              disabled={
                loading || !formData.zoom_account_id || !formData.zoom_client_id || !formData.zoom_client_secret
              }
              className="w-full"
            >
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep(currentStep + 1)} className="w-full">
              Skip for Now
            </Button>
          </div>
        )

      case "google_drive":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enter your Google Drive API key to enable the media assets file browser.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="google_drive_api_key">Google Drive API Key</Label>
              <Input
                id="google_drive_api_key"
                type="password"
                value={formData.google_drive_api_key}
                onChange={(e) => setFormData((prev) => ({ ...prev, google_drive_api_key: e.target.value }))}
                placeholder="Enter API key"
              />
              <p className="text-xs text-muted-foreground">
                Create an API key in Google Cloud Console with Drive API enabled
              </p>
            </div>
            <Button
              onClick={handleSaveGoogleDrive}
              disabled={loading || !formData.google_drive_api_key}
              className="w-full"
            >
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep(currentStep + 1)} className="w-full">
              Skip for Now
            </Button>
          </div>
        )

      case "sms":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Configure Telnyx for SMS notifications and bulk messaging.</AlertDescription>
            </Alert>
            <Button
              onClick={() => window.open(`/dashboard/sms-notifications?tenant=${churchId}`, "_blank")}
              className="w-full"
            >
              <Phone className="w-4 h-4 mr-2" />
              Configure SMS Settings
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep(currentStep + 1)} className="w-full">
              Skip for Now
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Church Setup Wizard - {churchName}</DialogTitle>
            <DialogDescription>
              Complete these steps to fully configure the church. Required steps are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Setup Progress</span>
                <span className="text-muted-foreground">
                  {completedSteps} of {SETUP_STEPS.length} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {completedRequiredSteps < requiredSteps.length && (
                <p className="text-xs text-muted-foreground">
                  {requiredSteps.length - completedRequiredSteps} required step(s) remaining
                </p>
              )}
            </div>

            {/* Step Navigation */}
            <div className="grid grid-cols-2 gap-2">
              {SETUP_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                    currentStep === index ? "bg-primary/10 border-2 border-primary" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {setupStatus[step.id] ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {step.name}
                      {step.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Current Step Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">{SETUP_STEPS[currentStep].icon}</div>
                  <div>
                    <CardTitle className="text-lg">
                      {SETUP_STEPS[currentStep].name}
                      {SETUP_STEPS[currentStep].required && <span className="text-red-500 ml-1">*</span>}
                    </CardTitle>
                    <CardDescription>{SETUP_STEPS[currentStep].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>{renderStepContent()}</CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {currentStep < SETUP_STEPS.length - 1 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} variant="default">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <AssignLeadAdminDialog
        open={leadAdminDialogOpen}
        onOpenChange={setLeadAdminDialogOpen}
        churchId={churchId}
        churchName={churchName}
        currentLeadAdminId={null}
        onLeadAdminAssigned={() => {
          setSetupStatus((prev) => ({ ...prev, lead_admin: true }))
          loadSetupStatus()
        }}
      />

      <ChurchThemeEditorDialog
        open={themeEditorOpen}
        onOpenChange={setThemeEditorOpen}
        church={{ id: churchId, name: churchName } as any}
      />

      <Dialog open={slackBotDialogOpen} onOpenChange={setSlackBotDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Slack Bot</DialogTitle>
            <DialogDescription>Set up Slack bot credentials for {churchName}</DialogDescription>
          </DialogHeader>
          <SlackBotSetup tenantId={churchId} />
        </DialogContent>
      </Dialog>

      <Dialog open={groupMeDialogOpen} onOpenChange={setGroupMeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure GroupMe</DialogTitle>
            <DialogDescription>Set up GroupMe credentials for {churchName}</DialogDescription>
          </DialogHeader>
          <GroupMeSetup tenantId={churchId} />
        </DialogContent>
      </Dialog>

      <Dialog open={zoomDialogOpen} onOpenChange={setZoomDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Zoom</DialogTitle>
            <DialogDescription>Set up Zoom credentials for {churchName}</DialogDescription>
          </DialogHeader>
          <ZoomSetup tenantId={churchId} />
        </DialogContent>
      </Dialog>
    </>
  )
}
