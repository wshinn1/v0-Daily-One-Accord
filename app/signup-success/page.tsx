import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Account Created Successfully!</CardTitle>
          <CardDescription className="text-center">One more step to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <p className="font-semibold mb-1">Please confirm your email before logging in</p>
              <p className="text-sm">
                We've sent a confirmation link to your email address. Click the link to verify your account.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>Check your email inbox (and spam folder if needed)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>Click the confirmation link in the email</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>Return here and log in to access your dashboard</span>
            </p>
          </div>

          <div className="pt-4 space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
