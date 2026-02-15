"use client"

import type React from "react"

import { useEffect } from "react"
import { initSentry } from "@/lib/errors/sentry"

export function SentryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Sentry on client-side
    initSentry()
  }, [])

  return <>{children}</>
}
