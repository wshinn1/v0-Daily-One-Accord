"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

type CSVImportDialogProps = {}

const MEMBER_FIELDS = [
  { value: "first_name", label: "First Name", required: true },
  { value: "last_name", label: "Last Name", required: true },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "street_address", label: "Street Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zip_code", label: "Zip Code" },
  { value: "country", label: "Country" },
  { value: "date_of_birth", label: "Date of Birth" },
  { value: "gender", label: "Gender" },
  { value: "marital_status", label: "Marital Status" },
  { value: "membership_status", label: "Membership Status" },
  { value: "join_date", label: "Join Date" },
  { value: "notes", label: "Notes" },
]

export function CSVImportDialog({}: CSVImportDialogProps = {}) {
  console.log("[v0] CSVImportDialog rendering...")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<"upload" | "mapping" | "importing">("upload")
  const [csvHeaders, setCSVHeaders] = useState<string[]>([])
  const [csvData, setCSVData] = useState<string[][]>([])
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (
      !selectedFile.name.endsWith(".csv") &&
      !selectedFile.name.endsWith(".xls") &&
      !selectedFile.name.endsWith(".xlsx")
    ) {
      alert("Please select a CSV or Excel file")
      return
    }

    setFile(selectedFile)
    setResult(null)

    // Parse CSV to extract headers
    const text = await selectedFile.text()
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/['"]/g, ""))
    const data = lines.slice(1).map((line) => line.split(",").map((v) => v.trim().replace(/['"]/g, "")))

    setCSVHeaders(headers)
    setCSVData(data)

    // Auto-map common field names
    const autoMapping: Record<string, string> = {}
    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase()
      if (lowerHeader.includes("first") && lowerHeader.includes("name")) autoMapping[header] = "first_name"
      else if (lowerHeader.includes("last") && lowerHeader.includes("name")) autoMapping[header] = "last_name"
      else if (lowerHeader.includes("email")) autoMapping[header] = "email"
      else if (lowerHeader.includes("phone")) autoMapping[header] = "phone"
      else if (lowerHeader.includes("city")) autoMapping[header] = "city"
      else if (lowerHeader.includes("state")) autoMapping[header] = "state"
      else if (lowerHeader.includes("zip")) autoMapping[header] = "zip_code"
      else if (lowerHeader.includes("address") && !lowerHeader.includes("email")) autoMapping[header] = "street_address"
      else if (lowerHeader.includes("gender")) autoMapping[header] = "gender"
      else if (lowerHeader.includes("birth") || lowerHeader.includes("dob")) autoMapping[header] = "date_of_birth"
      else if (lowerHeader.includes("marital")) autoMapping[header] = "marital_status"
      else if (lowerHeader.includes("status")) autoMapping[header] = "membership_status"
      else if (lowerHeader.includes("join") && lowerHeader.includes("date")) autoMapping[header] = "join_date"
      else if (lowerHeader.includes("note")) autoMapping[header] = "notes"
    })

    setFieldMapping(autoMapping)
    setStep("mapping")
  }

  const handleImport = async () => {
    setStep("importing")
    setResult(null)

    try {
      // Transform CSV data using field mapping
      const members = csvData
        .map((row) => {
          const member: any = {}
          csvHeaders.forEach((header, index) => {
            const mappedField = fieldMapping[header]
            if (mappedField && mappedField !== "ignore") {
              member[mappedField] = row[index]
            }
          })
          return member
        })
        .filter((member) => member.first_name || member.last_name)

      if (members.length === 0) {
        setResult({ success: false, message: "No valid members found. Please map First Name or Last Name." })
        setStep("mapping")
        return
      }

      console.log("[v0] Importing members:", members.length)

      const response = await fetch("/api/members/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Import successful:", data.imported)
        setResult({
          success: true,
          message: `Successfully imported ${data.imported} members`,
          count: data.imported,
        })
        setTimeout(() => {
          setOpen(false)
          resetDialog()
          console.log("[v0] Refreshing page after import...")
          router.refresh()
        }, 2000)
      } else {
        console.error("[v0] Import failed:", data.error)
        setResult({ success: false, message: data.error || "Import failed" })
        setStep("mapping")
      }
    } catch (error: any) {
      console.error("[v0] Import error:", error)
      setResult({ success: false, message: error.message })
      setStep("mapping")
    }
  }

  const resetDialog = () => {
    setFile(null)
    setStep("upload")
    setCSVHeaders([])
    setCSVData([])
    setFieldMapping({})
    setResult(null)
  }

  const downloadTemplate = () => {
    const template = `first_name,last_name,email,phone,street_address,city,state,zip_code,date_of_birth,gender,marital_status,membership_status,join_date,notes
John,Doe,john.doe@example.com,555-0100,123 Main St,Springfield,IL,62701,1980-01-15,Male,Married,active,2020-01-01,Regular attender
Jane,Smith,jane.smith@example.com,555-0101,456 Oak Ave,Springfield,IL,62702,1985-05-20,Female,Single,active,2021-03-15,Volunteer coordinator`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "member_import_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const requiredFieldsMapped = MEMBER_FIELDS.filter((f) => f.required).every((f) =>
    Object.values(fieldMapping).includes(f.value),
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import Members from CSV/Excel"}
            {step === "mapping" && "Map Your Fields"}
            {step === "importing" && "Importing Members..."}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a CSV or Excel file to import multiple church members at once."}
            {step === "mapping" &&
              "Match your spreadsheet columns to our member fields. We've auto-detected some matches."}
            {step === "importing" && "Please wait while we import your members..."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <Button variant="outline" onClick={downloadTemplate} className="w-full bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">{file ? file.name : "Click to upload file"}</p>
                <p className="text-xs text-muted-foreground">CSV or Excel files. Maximum 1000 members per import.</p>
              </label>
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">Flexible Import:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Upload any CSV/Excel format - we'll help you map the fields</li>
                <li>Required fields: First Name, Last Name</li>
                <li>All other fields are optional</li>
                <li>Duplicate emails will be updated, not duplicated</li>
              </ul>
            </div>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Map your spreadsheet columns to our member fields. Fields marked with * are required.
              </AlertDescription>
            </Alert>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {csvHeaders.map((header) => (
                  <div key={header} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{header}</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sample: {csvData[0]?.[csvHeaders.indexOf(header)] || "N/A"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <Select
                        value={fieldMapping[header] || "ignore"}
                        onValueChange={(value) => setFieldMapping({ ...fieldMapping, [header]: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ignore">Don't Import</SelectItem>
                          {MEMBER_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label} {field.required && "*"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {!requiredFieldsMapped && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please map required fields: First Name and Last Name</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="mt-4" variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === "importing" && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Importing {csvData.length} members...</p>
            {result && (
              <Alert className="mt-4" variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          )}
          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={!requiredFieldsMapped}>
                Import {csvData.length} Members
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
