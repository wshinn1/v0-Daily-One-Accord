"use client"

import type { ReactNode } from "react"
import { hasPermission, type UserRole, type PERMISSIONS } from "@/lib/permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

interface PermissionGuardProps {
  children: ReactNode
  userRole: UserRole
  permission: keyof typeof PERMISSIONS
  fallback?: ReactNode
  showAlert?: boolean
}

export function PermissionGuard({ children, userRole, permission, fallback, showAlert = true }: PermissionGuardProps) {
  const hasAccess = hasPermission(userRole, permission)

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>

    if (showAlert) {
      return (
        <Alert className="border-destructive/50">
          <Shield className="w-4 h-4" />
          <AlertDescription>You don't have permission to access this feature.</AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}
