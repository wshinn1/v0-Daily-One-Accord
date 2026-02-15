"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Mail, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function GivingReports() {
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())

  async function generateYearEndStatements() {
    setLoading(true)
    try {
      const response = await fetch(`/api/giving/reports/year-end?year=${year}`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Statements Generated",
          description: "Year-end giving statements have been generated and are ready for download.",
        })
      } else {
        throw new Error("Failed to generate statements")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate year-end statements. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function exportDonations() {
    try {
      const response = await fetch(`/api/giving/export/donations?year=${year}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `donations-${year}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export Complete",
          description: "Donation data has been exported successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export donations. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function exportDonors() {
    try {
      const response = await fetch("/api/giving/export/donors")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "donors.csv"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export Complete",
          description: "Donor data has been exported successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export donors. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground">Generate reports and export giving data</p>
      </div>

      {/* Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Report Year</CardTitle>
          <CardDescription>Select the year for reports and exports</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Year-End Statements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Year-End Giving Statements
          </CardTitle>
          <CardDescription>
            Generate IRS-compliant giving statements for all donors for the selected year
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={generateYearEndStatements} disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Statements
            </Button>
            <Button variant="outline" disabled>
              <Mail className="h-4 w-4 mr-2" />
              Email to All Donors
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Statements will be generated as PDF files with your church branding and IRS-compliant formatting.
          </p>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Donations
            </CardTitle>
            <CardDescription>Download donation data for accounting software</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={exportDonations} variant="outline" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <p className="text-sm text-muted-foreground">
              Includes: Date, Donor, Amount, Fund, Campaign, Payment Method, Status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Donors
            </CardTitle>
            <CardDescription>Download donor contact information and giving history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={exportDonors} variant="outline" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <p className="text-sm text-muted-foreground">
              Includes: Name, Email, Phone, Total Given, Donation Count, Last Gift Date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Reconciliation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Financial Reconciliation
          </CardTitle>
          <CardDescription>Match donations to Stripe payouts and track fees</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Generate Reconciliation Report
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Coming soon: Automated reconciliation with Stripe payouts
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
