"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink, CheckCircle2, Copy } from "lucide-react"
import { useState } from "react"

export function SlackSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<string | null>(null)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"

  const copyToClipboard = (text: string, step: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const interactiveUrl = `${siteUrl}/api/slack/interactive`
  const commandUrl = `${siteUrl}/api/slack/commands`

  return (
    <div className="space-y-6">
      {/* Step 1 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            1
          </div>
          <h3 className="font-semibold">Create a Slack App</h3>
        </div>
        <div className="ml-8 space-y-2">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Go to{" "}
              <a
                href="https://api.slack.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                https://api.slack.com/apps <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Click <strong>"Create New App"</strong> → <strong>"From scratch"</strong>
            </li>
            <li>Name it (e.g., "Church Attendance Bot")</li>
            <li>Select your Slack workspace</li>
          </ol>
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            2
          </div>
          <h3 className="font-semibold">Configure Slash Commands</h3>
        </div>
        <div className="ml-8 space-y-3">
          <p className="text-sm">
            In your Slack App settings, go to <strong>"Slash Commands"</strong>
          </p>

          <div>
            <p className="text-sm font-medium mb-2">Create a new command:</p>
            <Alert>
              <AlertDescription>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Command:</strong> <code className="bg-muted px-1 py-0.5 rounded">/attendance</code>
                  </li>
                  <li>
                    <strong>Request URL:</strong>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 text-xs bg-background px-2 py-1 rounded border">{commandUrl}</code>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(commandUrl, "command")}>
                        {copiedStep === "command" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </li>
                  <li>
                    <strong>Short Description:</strong> Log church service attendance
                  </li>
                  <li>
                    <strong>Usage Hint:</strong> [Opens attendance form]
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            3
          </div>
          <h3 className="font-semibold">Enable Interactivity</h3>
        </div>
        <div className="ml-8 space-y-3">
          <p className="text-sm">
            Go to <strong>"Interactivity & Shortcuts"</strong> and turn on Interactivity
          </p>

          <div>
            <p className="text-sm font-medium mb-2">Set the Request URL:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded border">{interactiveUrl}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(interactiveUrl, "interactive")}>
                {copiedStep === "interactive" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            4
          </div>
          <h3 className="font-semibold">Configure OAuth & Permissions</h3>
        </div>
        <div className="ml-8 space-y-3">
          <p className="text-sm">
            Go to <strong>"OAuth & Permissions"</strong>
          </p>

          <div>
            <p className="text-sm font-medium mb-2">Add these Bot Token Scopes:</p>
            <Alert>
              <AlertDescription>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">commands</code>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">chat:write</code>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Step 5 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            5
          </div>
          <h3 className="font-semibold">Install App to Workspace</h3>
        </div>
        <div className="ml-8 space-y-2">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Go to <strong>"Install App"</strong> in the sidebar
            </li>
            <li>
              Click <strong>"Install to Workspace"</strong>
            </li>
            <li>
              Review permissions and click <strong>"Allow"</strong>
            </li>
            <li>
              Copy the <strong>Bot User OAuth Token</strong> (starts with xoxb-)
            </li>
          </ol>
        </div>
      </div>

      {/* Step 6 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            6
          </div>
          <h3 className="font-semibold">Get Signing Secret</h3>
        </div>
        <div className="ml-8 space-y-2">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Go to <strong>"Basic Information"</strong>
            </li>
            <li>
              Find <strong>"App Credentials"</strong> section
            </li>
            <li>
              Copy the <strong>Signing Secret</strong>
            </li>
          </ol>
        </div>
      </div>

      {/* Step 7 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            7
          </div>
          <h3 className="font-semibold">Add Environment Variables</h3>
        </div>
        <div className="ml-8 space-y-2">
          <p className="text-sm">Add these to your Vercel project environment variables:</p>
          <Alert>
            <AlertDescription>
              <ul className="space-y-2 text-sm font-mono">
                <li>
                  <strong>SLACK_BOT_TOKEN</strong> = Your Bot User OAuth Token
                </li>
                <li>
                  <strong>SLACK_SIGNING_SECRET</strong> = Your Signing Secret
                </li>
              </ul>
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground mt-2">
            After adding these variables, redeploy your site for the changes to take effect.
          </p>
        </div>
      </div>

      {/* Step 8 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            8
          </div>
          <h3 className="font-semibold">Test the Integration</h3>
        </div>
        <div className="ml-8 space-y-2">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Go to any channel in your Slack workspace</li>
            <li>
              Type <code className="bg-muted px-1 py-0.5 rounded">/attendance</code>
            </li>
            <li>Click the "Log Attendance" button</li>
            <li>Fill out the form and submit</li>
            <li>Check your attendance records in the dashboard</li>
          </ol>
        </div>
      </div>

      <Alert>
        <AlertDescription className="text-sm">
          <strong>Note:</strong> You need to be a Slack workspace admin to create and install apps. Once configured, any
          team member can use the /attendance command to log attendance via interactive forms.
        </AlertDescription>
      </Alert>
    </div>
  )
}
