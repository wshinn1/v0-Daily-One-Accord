"use client"

import { useReportWebVitals } from "next/web-vitals"

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log web vitals for monitoring
    if (process.env.NODE_ENV === "production") {
      // Send to analytics endpoint
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      })

      // Use sendBeacon if available, fallback to fetch
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/vitals", body)
      } else {
        fetch("/api/analytics/vitals", {
          body,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          keepalive: true,
        }).catch(console.error)
      }
    } else {
      // Log in development
      console.log("[Web Vitals]", metric.name, metric.value, metric.rating)
    }
  })

  return null
}
