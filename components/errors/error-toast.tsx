"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface ErrorToastProps {
  error: Error | null
  onDismiss?: () => void
}

export function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      })
      onDismiss?.()
    }
  }, [error, toast, onDismiss])

  return null
}
