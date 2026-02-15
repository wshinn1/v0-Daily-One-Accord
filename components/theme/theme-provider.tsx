"use client"

import type React from "react"

import { useEffect } from "react"

interface ThemeConfig {
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  background_color?: string
  text_color?: string
  heading_font?: string
  body_font?: string
  font_size_base?: string
  font_size_heading?: string
}

interface ThemeProviderProps {
  theme: ThemeConfig
  children: React.ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    // Apply CSS custom properties for colors
    const root = document.documentElement

    if (theme.primary_color) {
      root.style.setProperty("--color-primary", theme.primary_color)
    }
    if (theme.secondary_color) {
      root.style.setProperty("--color-secondary", theme.secondary_color)
    }
    if (theme.accent_color) {
      root.style.setProperty("--color-accent", theme.accent_color)
    }
    if (theme.background_color) {
      root.style.setProperty("--color-background", theme.background_color)
    }
    if (theme.text_color) {
      root.style.setProperty("--color-text", theme.text_color)
    }

    // Apply typography
    if (theme.heading_font) {
      root.style.setProperty("--font-heading", theme.heading_font)
    }
    if (theme.body_font) {
      root.style.setProperty("--font-body", theme.body_font)
    }
    if (theme.font_size_base) {
      root.style.setProperty("--font-size-base", theme.font_size_base)
    }
    if (theme.font_size_heading) {
      root.style.setProperty("--font-size-heading", theme.font_size_heading)
    }

    // Cleanup function to reset styles when component unmounts
    return () => {
      root.style.removeProperty("--color-primary")
      root.style.removeProperty("--color-secondary")
      root.style.removeProperty("--color-accent")
      root.style.removeProperty("--color-background")
      root.style.removeProperty("--color-text")
      root.style.removeProperty("--font-heading")
      root.style.removeProperty("--font-body")
      root.style.removeProperty("--font-size-base")
      root.style.removeProperty("--font-size-heading")
    }
  }, [theme])

  return <>{children}</>
}
