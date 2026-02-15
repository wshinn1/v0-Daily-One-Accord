"use client"

import { useEffect, useState } from "react"

interface BusinessPlanContentProps {
  userEmail: string
  userFullName: string
}

export function BusinessPlanContent({ userEmail, userFullName }: BusinessPlanContentProps) {
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/business-plan-content.html")
      .then((res) => res.text())
      .then((html) => {
        setContent(html)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error loading business plan:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full prose prose-lg max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
