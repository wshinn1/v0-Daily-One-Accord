"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Circle, ExternalLink, AlertCircle } from "lucide-react"

interface SlackSetupWizardProps {
  onComplete: (webhookUrl: string, botToken: string) => void
  onCancel: () => void
}

export function SlackSetupWizard({ onComplete, onCancel }: SlackSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [botToken, setBotToken] = useState("")
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    {
      number: 1,
      title: "Create or Select Your Slack App",
      description: "Go to api.slack.com/apps and create a new app or select an existing one",
      action: (
        <Button variant="outline" onClick={() => window.open("https://api.slack.com/apps", "_blank")}>
          Open Slack Apps <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      number: 2,
      title: "Add Required OAuth Scopes",
      description: "In your app settings, go to 'OAuth & Permissions' and add these Bot Token Scopes:",
      details: (
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
          <li>
            <code className="bg-muted px-1 py-0.5 rounded">channels:read</code> - List public channels
          </li>
          <li>
            <code className="bg-muted px-1 py-0.5 rounded">channels:write</code> - Create and manage public channels
          </li>
          <li>
            <code className="bg-muted px-1 py-0.5 rounded">groups:read</code> - List private channels
          </li>
          <li>
            <code className="bg-muted px-1 py-0.5 rounded">groups:write</code> - Create and manage private channels
          </li>
          <li>
            <code className="bg-muted px-1 py-0.5 rounded">chat:write</code> - Send messages to channels
          </li>
        </ul>
      ),
    },
    {
      number: 3,
      title: "Reinstall Your App",
      description:
        "CRITICAL: After adding scopes, scroll to the top of 'OAuth & Permissions' and click 'Reinstall to Workspace'. Approve the new permissions.",
      alert: (
        <Alert className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your old token won't have the new scopes. You MUST reinstall to get a new token.
          </AlertDescription>
        </Alert>
      ),
    },
    {
      number: 4,
      title: "Copy Your Bot User OAuth Token",
      description:
        "After reinstalling, copy the 'Bot User OAuth Token' from the OAuth & Permissions page. It starts with 'xoxb-'",
      input: (
        <div className="space-y-2 mt-2">
          <Label htmlFor="bot-token">Bot User OAuth Token</Label>
          <Input
            id="bot-token"
            type="password"
            placeholder="xoxb-..."
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
          />
          {botToken && !botToken.startsWith("xoxb-") && (
            <p className="text-sm text-destructive">Token should start with 'xoxb-'</p>
          )}
        </div>
      ),
    },
    {
      number: 5,
      title: "Create an Incoming Webhook",
      description: "Go to 'Incoming Webhooks', activate it, and add a new webhook to a channel",
      input: (
        <div className="space-y-2 mt-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://hooks.slack.com/services/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          {webhookUrl && !webhookUrl.startsWith("https://hooks.slack.com/") && (
            <p className="text-sm text-destructive">Webhook URL should start with 'https://hooks.slack.com/'</p>
          )}
        </div>
      ),
    },
  ]

  const markStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber])
    }
    if (stepNumber < steps.length) {
      setCurrentStep(stepNumber + 1)
    }
  }

  const canComplete = () => {
    return (
      webhookUrl.startsWith("https://hooks.slack.com/") && botToken.startsWith("xoxb-") && completedSteps.length >= 3
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Slack Integration Setup</h3>
        <p className="text-sm text-muted-foreground">
          Follow these steps to configure your Slack integration correctly
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <Card
            key={step.number}
            className={`p-4 ${
              currentStep === step.number
                ? "border-primary"
                : completedSteps.includes(step.number)
                  ? "border-green-500"
                  : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {completedSteps.includes(step.number) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-medium">
                    Step {step.number}: {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {step.details}
                {step.alert}
                {step.input}
                {step.action}
                {currentStep === step.number && !step.input && (
                  <Button size="sm" onClick={() => markStepComplete(step.number)} className="mt-2">
                    Mark as Complete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onComplete(webhookUrl, botToken)} disabled={!canComplete()}>
          Complete Setup
        </Button>
      </div>

      {!canComplete() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Complete all steps and enter valid webhook URL and bot token to finish setup
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
