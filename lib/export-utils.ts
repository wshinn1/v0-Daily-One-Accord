export function convertToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) {
    return ""
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Create header row
  const headerRow = csvHeaders.map((header) => `"${header}"`).join(",")

  // Create data rows
  const dataRows = data.map((row) => {
    return csvHeaders
      .map((header) => {
        const value = row[header]
        // Handle null/undefined
        if (value === null || value === undefined) return '""'
        // Handle objects/arrays
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        // Handle strings with quotes or commas
        return `"${String(value).replace(/"/g, '""')}"`
      })
      .join(",")
  })

  return [headerRow, ...dataRows].join("\n")
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function formatDateForExport(date: string | Date | null): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export function formatDateTimeForExport(date: string | Date | null): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleString()
}
