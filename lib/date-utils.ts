/**
 * Simple date formatting utilities using native JavaScript
 * Replaces date-fns to avoid external dependencies
 */

export function formatDate(date: Date | string, formatStr: string): string {
  const d = typeof date === "string" ? new Date(date) : date

  // Handle invalid dates
  if (isNaN(d.getTime())) {
    return "Invalid Date"
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = months[d.getMonth()]
  const day = d.getDate()
  const year = d.getFullYear()
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12

  // Support common format patterns
  switch (formatStr) {
    case "MMM d":
      return `${month} ${day}`
    case "MMM d, yyyy":
      return `${month} ${day}, ${year}`
    case "MMM d, yyyy 'at' h:mm a":
      return `${month} ${day}, ${year} at ${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`
    default:
      // Fallback to ISO string
      return d.toLocaleDateString()
  }
}
