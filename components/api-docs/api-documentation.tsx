"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const API_ENDPOINTS = {
  members: [
    {
      method: "GET",
      path: "/api/export/members",
      description: "Export member directory as CSV",
      auth: "Required",
      rateLimit: "10 requests per hour",
      response: "CSV file download",
    },
  ],
  attendance: [
    {
      method: "GET",
      path: "/api/export/attendance",
      description: "Export attendance records as CSV",
      auth: "Required",
      rateLimit: "10 requests per hour",
      params: [
        { name: "start_date", type: "string", description: "Filter by start date (ISO 8601)" },
        { name: "end_date", type: "string", description: "Filter by end date (ISO 8601)" },
      ],
      response: "CSV file download",
    },
  ],
  webhooks: [
    {
      method: "GET",
      path: "/api/webhooks",
      description: "List all webhooks for your tenant",
      auth: "Required",
      response: {
        type: "array",
        example: [
          {
            id: "uuid",
            name: "My Webhook",
            url: "https://example.com/webhook",
            events: ["member.created", "attendance.recorded"],
            is_active: true,
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/api/webhooks",
      description: "Create a new webhook",
      auth: "Required (Admin, Pastor, or Elder)",
      body: {
        name: "string (required)",
        url: "string (required)",
        events: "array of strings (required)",
      },
      response: {
        type: "object",
        example: {
          id: "uuid",
          name: "My Webhook",
          url: "https://example.com/webhook",
          secret: "generated_secret_key",
          events: ["member.created"],
          is_active: true,
        },
      },
    },
  ],
  onboarding: [
    {
      method: "GET",
      path: "/api/onboarding/progress",
      description: "Get onboarding progress for your tenant",
      auth: "Required",
      response: {
        type: "object",
        example: {
          completed_steps: ["profile", "members"],
          current_step: "event",
          started_at: "2025-01-01T00:00:00Z",
          completed_at: null,
        },
      },
    },
    {
      method: "POST",
      path: "/api/onboarding/progress",
      description: "Update onboarding progress",
      auth: "Required",
      body: {
        completed_steps: "array of strings",
        skipped: "boolean",
      },
      response: {
        type: "object",
        example: {
          completed_steps: ["profile", "members", "event"],
          updated_at: "2025-01-01T00:00:00Z",
        },
      },
    },
  ],
}

const WEBHOOK_EVENTS = [
  { event: "member.created", description: "Triggered when a new member is added to the directory" },
  { event: "member.updated", description: "Triggered when a member's information is updated" },
  { event: "member.deleted", description: "Triggered when a member is removed" },
  { event: "attendance.recorded", description: "Triggered when attendance is recorded for an event" },
  { event: "event.created", description: "Triggered when a new event is created" },
  { event: "event.updated", description: "Triggered when an event is updated" },
  { event: "class.enrolled", description: "Triggered when someone enrolls in a class" },
  { event: "sms.sent", description: "Triggered when an SMS message is sent" },
  { event: "newsletter.sent", description: "Triggered when a newsletter is sent" },
]

export function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>All API requests require authentication using your Supabase session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Session-based Authentication</h4>
            <p className="text-sm text-muted-foreground mb-4">
              API requests are authenticated using your browser session. Make sure you're logged in before making
              requests.
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Example Request</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard('fetch("/api/webhooks", {\n  credentials: "include"\n})', "auth-example")
                  }
                >
                  {copiedCode === "auth-example" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-xs">
                {`fetch("/api/webhooks", {
  credentials: "include"
})`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
          <CardDescription>API endpoints have rate limits to prevent abuse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Export endpoints</span>
              <Badge variant="outline">10 requests/hour</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>General API endpoints</span>
              <Badge variant="outline">100 requests/minute</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Authentication endpoints</span>
              <Badge variant="outline">5 requests/15 minutes</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="members">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            </TabsList>

            {Object.entries(API_ENDPOINTS).map(([category, endpoints]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Authentication:</span>
                          <span className="ml-2 font-medium">{endpoint.auth}</span>
                        </div>
                        {endpoint.rateLimit && (
                          <div>
                            <span className="text-muted-foreground">Rate Limit:</span>
                            <span className="ml-2 font-medium">{endpoint.rateLimit}</span>
                          </div>
                        )}
                      </div>

                      {endpoint.params && (
                        <div>
                          <h5 className="font-medium mb-2">Query Parameters</h5>
                          <div className="space-y-2">
                            {endpoint.params.map((param, i) => (
                              <div key={i} className="text-sm">
                                <code className="bg-muted px-2 py-1 rounded">{param.name}</code>
                                <span className="text-muted-foreground ml-2">({param.type})</span>
                                <p className="text-muted-foreground mt-1">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {endpoint.body && (
                        <div>
                          <h5 className="font-medium mb-2">Request Body</h5>
                          <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-xs">{JSON.stringify(endpoint.body, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {endpoint.response && typeof endpoint.response === "object" && (
                        <div>
                          <h5 className="font-medium mb-2">Response</h5>
                          <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-xs">{JSON.stringify(endpoint.response.example, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Webhook Events */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>Available event types for webhook subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {WEBHOOK_EVENTS.map((item) => (
              <div key={item.event} className="flex items-start gap-3 p-3 rounded-lg border">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.event}</code>
                <p className="text-sm text-muted-foreground flex-1">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Signature Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Signature Verification</CardTitle>
          <CardDescription>Verify webhook requests are from Daily One Accord</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            All webhook requests include an X-Webhook-Signature header. Verify this signature to ensure the request is
            authentic.
          </p>
          <div className="bg-muted p-4 rounded-lg font-mono text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Node.js Example</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    `const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}`,
                    "webhook-verify",
                  )
                }
              >
                {copiedCode === "webhook-verify" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <pre>{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
