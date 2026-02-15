import type React from "react"
import { useDroppable } from "@dnd-kit/core"

interface KanbanColumnProps {
  id: string
  title: string
  count: number
  children: React.ReactNode
  color: "blue" | "amber" | "emerald"
}

export function KanbanColumn({ id, title, count, children, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const colorClasses = {
    blue: {
      headerBg: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.12) 100%)",
      badgeBg: "rgba(59, 130, 246, 0.15)",
      borderColor: "rgba(59, 130, 246, 0.2)",
      hoverBg: "rgba(59, 130, 246, 0.04)",
      glowColor: "rgba(59, 130, 246, 0.15)",
      color: "#3B82F6",
    },
    amber: {
      headerBg: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.12) 100%)",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      hoverBg: "rgba(245, 158, 11, 0.04)",
      glowColor: "rgba(245, 158, 11, 0.15)",
      color: "#F59E0B",
    },
    emerald: {
      headerBg: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.12) 100%)",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      hoverBg: "rgba(16, 185, 129, 0.04)",
      glowColor: "rgba(16, 185, 129, 0.15)",
      color: "#10B981",
    },
  }

  const colors = colorClasses[color]

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-sm shadow-sm"
        style={{
          background: colors.headerBg,
          borderColor: colors.borderColor,
        }}
      >
        <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
          style={{
            backgroundColor: colors.badgeBg,
            color: colors.color,
          }}
        >
          {count}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="min-h-[500px] rounded-xl border-2 border-dashed p-3 transition-all duration-300 ease-out"
        style={{
          borderColor: isOver ? colors.color : "hsl(var(--border))",
          backgroundColor: isOver ? colors.hoverBg : "transparent",
          transform: isOver ? "scale(1.01)" : "scale(1)",
          boxShadow: isOver ? `0 0 20px ${colors.glowColor}` : "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { KanbanColumn as KanbanColumnComponent }
