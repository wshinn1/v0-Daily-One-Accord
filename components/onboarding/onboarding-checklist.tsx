"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ChevronRight, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OnboardingStep {
  id: string
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "profile",
    title: "Complete Church Profile",
    description: "Add your church name, logo, and basic information",
    action: {
      label: "Go to Settings",
      href: "/dashboard/settings",
    },
  },
  {
    id: "members",
    title: "Add Your First Members",
    description: "Import or manually add members to your directory",
    action: {
      label: "Add Members",
      href: "/dashboard/users",
    },
  },
  {
    id: "event",
    title: "Create Your First Event",
    description: "Set up a service or event for attendance tracking",
    action: {
      label: "Create Event",
      href: "/dashboard/calendar",
    },
  },
  {
    id: "slack",
    title: "Connect Slack (Optional)",
    description: "Integrate with Slack for team notifications",
    action: {
      label: "Setup Slack",
      href: "/dashboard/slack",
    },
  },
  {
    id: "sms",
    title: "Enable SMS Notifications (Optional)",
    description: "Set up SMS messaging for your congregation",
    action: {
      label: "Setup SMS",
      href: "/dashboard/sms-notifications",
    },
  },
]

export function OnboardingChecklist() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/onboarding/progress")
      if (response.ok) {
        const data = await response.json()
        setCompletedSteps(data.completed_steps || [])
        if (data.completed_at || data.skipped) {
          setIsVisible(false)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching onboarding progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markStepComplete = async (stepId: string) => {
    try {
      const newCompletedSteps = [...completedSteps, stepId]
      setCompletedSteps(newCompletedSteps)

      await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed_steps: newCompletedSteps }),
      })

      if (newCompletedSteps.length === ONBOARDING_STEPS.length) {
        toast({
          title: "Onboarding complete!",
          description: "You're all set up and ready to go.",
        })
      }
    } catch (error) {
      console.error("[v0] Error updating progress:", error)
    }
  }

  const skipOnboarding = async () => {
    try {
      await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipped: true }),
      })
      setIsVisible(false)
    } catch (error) {
      console.error("[v0] Error skipping onboarding:", error)
    }
  }

  if (!isVisible || isLoading) return null

  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>Welcome to Daily One Accord!</CardTitle>
            <CardDescription>Complete these steps to get the most out of your church management system</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={skipOnboarding}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedSteps.length} of {ONBOARDING_STEPS.length} completed
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id)
          return (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <button onClick={() => !isCompleted && markStepComplete(step.id)} className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {step.action && !isCompleted && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={step.action.href}>
                    {step.action.label}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
