"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  category: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey
        const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    },
    [shortcuts],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

export function useGlobalKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: "h",
      description: "Go to Dashboard Home",
      category: "Navigation",
      action: () => router.push("/dashboard"),
    },
    {
      key: "u",
      description: "Go to Users",
      category: "Navigation",
      action: () => router.push("/dashboard/users"),
    },
    {
      key: "a",
      description: "Go to Attendance",
      category: "Navigation",
      action: () => router.push("/dashboard/attendance"),
    },
    {
      key: "c",
      description: "Go to Calendar",
      category: "Navigation",
      action: () => router.push("/dashboard/calendar"),
    },
    {
      key: "t",
      description: "Go to Teams",
      category: "Navigation",
      action: () => router.push("/dashboard/teams"),
    },
    {
      key: "s",
      description: "Go to Settings",
      category: "Navigation",
      action: () => router.push("/dashboard/settings"),
    },
    // Search
    {
      key: "/",
      description: "Focus Search",
      category: "Search",
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
    },
    // Help
    {
      key: "?",
      shiftKey: true,
      description: "Show Keyboard Shortcuts",
      category: "Help",
      action: () => {
        // Trigger keyboard shortcuts modal
        const event = new CustomEvent("show-keyboard-shortcuts")
        window.dispatchEvent(event)
      },
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}
