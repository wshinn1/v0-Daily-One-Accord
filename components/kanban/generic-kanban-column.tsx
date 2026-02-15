"use client"

import type React from "react"
import { useDroppable } from "@dnd-kit/core"

interface GenericKanbanColumnProps {
  id: string
  title: string
  count: number
  children: React.ReactNode
  color: string // Accepts hex colors like "#3B82F6"
}

export function GenericKanbanColumn({ id, title, count, children, color }: GenericKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 }
  }

  const rgb = hexToRgb(color || "#3B82F6")
  const headerBg = `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12) 100%)`
  const badgeBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
  const hoverBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`
  const glowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-sm shadow-sm"
        style={{
          background: headerBg,
          borderColor: borderColor,
        }}
      >
        <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
          style={{
            backgroundColor: badgeBg,
            color: color,
          }}
        >
          {count}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="min-h-[500px] rounded-xl border-2 border-dashed p-3 transition-all duration-300 ease-out"
        style={{
          borderColor: isOver ? color : "hsl(var(--border))",
          backgroundColor: isOver ? hoverBg : "transparent",
          transform: isOver ? "scale(1.01)" : "scale(1)",
          boxShadow: isOver ? `0 0 20px ${glowColor}` : "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}
