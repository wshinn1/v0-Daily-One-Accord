"use client"

import { useEffect, useState } from "react"

export function MenuSyncInitializer() {
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    // Only sync once per session
    if (synced) return

    const syncMenuItems = async () => {
      try {
        console.log("[v0] Triggering menu sync...")
        const response = await fetch("/api/menu-visibility/sync/trigger")

        if (!response.ok) {
          console.log("[v0] Menu sync returned non-OK status:", response.status)
          return
        }

        const data = await response.json()

        if (data.success) {
          console.log("[v0] Menu sync completed:", data.message)
          setSynced(true)
        } else {
          console.log("[v0] Menu sync returned success: false")
        }
      } catch (error) {
        console.log("[v0] Menu sync skipped (likely rate limited)")
      }
    }

    // Sync on mount with a small delay to not block initial render
    const timer = setTimeout(syncMenuItems, 2000)
    return () => clearTimeout(timer)
  }, [synced])

  return null // This component doesn't render anything
}
