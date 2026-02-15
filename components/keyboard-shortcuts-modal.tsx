"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  category: string
}

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcutsModal({ shortcuts }: KeyboardShortcutsModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleShow = () => setIsOpen(true)
    window.addEventListener("show-keyboard-shortcuts", handleShow)
    return () => window.removeEventListener("show-keyboard-shortcuts", handleShow)
  }, [])

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    },
    {} as Record<string, KeyboardShortcut[]>,
  )

  const renderKeys = (shortcut: KeyboardShortcut) => {
    const keys = []
    if (shortcut.ctrlKey || shortcut.metaKey) {
      keys.push(<Kbd key="ctrl">⌘</Kbd>)
    }
    if (shortcut.shiftKey) {
      keys.push(<Kbd key="shift">⇧</Kbd>)
    }
    if (shortcut.altKey) {
      keys.push(<Kbd key="alt">⌥</Kbd>)
    }
    keys.push(<Kbd key="main">{shortcut.key.toUpperCase()}</Kbd>)

    return <div className="flex gap-1">{keys}</div>
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Use these shortcuts to navigate faster</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline">{category}</Badge>
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted">
                    <span className="text-sm">{shortcut.description}</span>
                    {renderKeys(shortcut)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          <p>Press ? to show this dialog anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
