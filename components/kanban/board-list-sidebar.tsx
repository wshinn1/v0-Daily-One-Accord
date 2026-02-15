"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Board {
  id: string
  name: string
  description: string | null
  board_type: string
}

interface BoardListSidebarProps {
  userRole?: string
  visibilitySettings?: any[]
}

export function BoardListSidebar({ userRole = "member", visibilitySettings = [] }: BoardListSidebarProps = {}) {
  const [boards, setBoards] = useState<Board[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const [newBoardDescription, setNewBoardDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const pathname = usePathname()

  const unitySetting = visibilitySettings.find(
    (setting) => setting.menu_item_key === "unity" && setting.role === userRole,
  )
  const isUnityVisible = visibilitySettings.length === 0 || unitySetting?.is_visible !== false

  console.log("[v0] BoardListSidebar - Unity visible:", isUnityVisible)
  console.log("[v0] BoardListSidebar - User role:", userRole)
  console.log("[v0] BoardListSidebar - Unity setting:", unitySetting)

  useEffect(() => {
    if (isUnityVisible) {
      console.log("[v0] Fetching boards...")
      fetchBoards()
    }
  }, [isUnityVisible])

  const fetchBoards = async () => {
    try {
      console.log("[v0] Calling /api/kanban/boards...")
      const response = await fetch("/api/kanban/boards")
      const data = await response.json()
      console.log("[v0] Boards API response:", data)
      if (data.boards) {
        console.log("[v0] Setting boards:", data.boards)
        setBoards(data.boards)
      } else {
        console.log("[v0] No boards in response")
      }
    } catch (error) {
      console.error("[v0] Error fetching boards:", error)
    }
  }

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/kanban/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBoardName,
          description: newBoardDescription,
          board_type: "custom",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBoards([...boards, data.board])
        setNewBoardName("")
        setNewBoardDescription("")
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("[v0] Error creating board:", error)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isUnityVisible) {
    console.log("[v0] Unity not visible, returning null")
    return null
  }

  console.log("[v0] Rendering boards:", boards)

  return (
    <div className="space-y-1">
      {boards.map((board) => (
        <Link
          key={board.id}
          href={`/dashboard/unity/${board.id}`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
            pathname === `/dashboard/unity/${board.id}` && "bg-accent",
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>{board.name}</span>
        </Link>
      ))}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3 px-3">
            <Plus className="h-4 w-4" />
            <span>New Board</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Kanban Board</DialogTitle>
            <DialogDescription>
              Create a custom kanban board to organize and track any type of work or project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="board-name">Board Name</Label>
              <Input
                id="board-name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="e.g., Projects, Tasks, Events"
              />
            </div>
            <div>
              <Label htmlFor="board-description">Description (Optional)</Label>
              <Textarea
                id="board-description"
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                placeholder="What is this board for?"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBoard} disabled={isCreating || !newBoardName.trim()}>
                {isCreating ? "Creating..." : "Create Board"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
