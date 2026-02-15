"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  botConfigs: Array<{
    team_id: string
    bot_name: string
    has_signing_secret: boolean
    has_bot_token: boolean
    created_at: string
  }>
  workspaces: Array<{
    team_id: string
    team_name: string
    church_tenant_id: string
    slack_workspace_url: string | null
  }>
  issues: string[]
  recommendations: string[]
}

interface SlackBotDiagnosticsProps {
  tenantId?: string
}

export function SlackBotDiagnostics({ tenantId }: SlackBotDiagnosticsProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const url = tenantId ? `/api/slack/diagnostics?tenantId=${tenantId}` : "/api/slack/diagnostics"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const error = await response.json()
        setResult({
          botConfigs: [],
          workspaces: [],
          issues: [error.error || "Failed to run diagnostics"],
          recommendations: ["Check your permissions and try again"],
        })
      }
    } catch (error) {
      console.error("[v0] Diagnostics error:", error)
      setResult({
        botConfigs: [],
        workspaces: [],
        issues: ["Failed to connect to server"],
        recommendations: ["Check your internet connection and try again"],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Slack Bot Diagnostics</CardTitle>
            <CardDescription>Check your Slack bot configuration status and troubleshoot issues</CardDescription>
          </div>
          <Button onClick={runDiagnostics} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Diagnostics
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Click "Run Diagnostics" to check your Slack bot configuration</AlertDescription>
          </Alert>
        )}

        {result && (
          <>
            {/* Bot Configurations */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                Bot Configurations
                {result.botConfigs.length > 0 ? (
                  <Badge variant="default">{result.botConfigs.length} found</Badge>
                ) : (
                  <Badge variant="destructive">None found</Badge>
                )}
              </h3>
              {result.botConfigs.length === 0 ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    No bot configurations found. You need to add a bot in the Slack Bot Configuration section above.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {result.botConfigs.map((bot) => (
                    <div key={bot.team_id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{bot.bot_name}</p>
                          <p className="text-sm text-muted-foreground">Team ID: {bot.team_id}</p>
                        </div>
                        {bot.has_signing_secret && bot.has_bot_token ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Incomplete
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {bot.has_signing_secret ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Signing Secret</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {bot.has_bot_token ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Bot Token</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workspace Links */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                Workspace Links
                {result.workspaces.length > 0 ? (
                  <Badge variant="default">{result.workspaces.length} found</Badge>
                ) : (
                  <Badge variant="destructive">None found</Badge>
                )}
              </h3>
              {result.workspaces.length === 0 ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    No workspace links found. Your bot needs to be linked to your church tenant.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {result.workspaces.map((workspace) => (
                    <div key={workspace.team_id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{workspace.team_name}</p>
                          <p className="text-sm text-muted-foreground">Team ID: {workspace.team_id}</p>
                          <p className="text-sm text-muted-foreground">
                            Linked to tenant: {workspace.church_tenant_id.substring(0, 8)}...
                          </p>
                        </div>
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Linked
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-destructive">Issues Found</h3>
                {result.issues.map((issue, index) => (
                  <Alert key={index} variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{issue}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Recommendations</h3>
                {result.recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Success */}
            {result.issues.length === 0 && result.botConfigs.length > 0 && result.workspaces.length > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  ✅ Your Slack bot is properly configured! Try running <code>/attendance</code> in Slack.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
