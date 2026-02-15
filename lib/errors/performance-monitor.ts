import { captureError } from "./sentry"

const SLOW_API_THRESHOLD = 3000 // 3 seconds
const SLOW_PAGE_THRESHOLD = 2000 // 2 seconds

export function monitorApiPerformance(path: string, startTime: number, endTime: number) {
  const duration = endTime - startTime

  if (duration > SLOW_API_THRESHOLD) {
    console.warn(`[v0] Slow API call detected: ${path} took ${duration}ms`)

    captureError(new Error(`Slow API: ${path}`), {
      duration,
      path,
      threshold: SLOW_API_THRESHOLD,
    })
  }

  return duration
}

export function monitorPageLoad(pageName: string, loadTime: number) {
  if (loadTime > SLOW_PAGE_THRESHOLD) {
    console.warn(`[v0] Slow page load: ${pageName} took ${loadTime}ms`)

    captureError(new Error(`Slow page load: ${pageName}`), {
      loadTime,
      pageName,
      threshold: SLOW_PAGE_THRESHOLD,
    })
  }
}
