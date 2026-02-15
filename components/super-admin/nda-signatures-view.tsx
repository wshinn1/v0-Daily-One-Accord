"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface NDASignature {
  id: string
  user_id: string
  full_name: string
  email: string
  signed_at: string
  ip_address: string
  document_version: string
  pdf_url: string
}

export function NDASignaturesView() {
  const [signatures, setSignatures] = useState<NDASignature[]>([])
  const [filteredSignatures, setFilteredSignatures] = useState<NDASignature[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSignatures()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSignatures(signatures)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredSignatures(
        signatures.filter(
          (sig) => sig.full_name.toLowerCase().includes(query) || sig.email.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, signatures])

  const fetchSignatures = async () => {
    try {
      const response = await fetch("/api/super-admin/nda-signatures")
      if (!response.ok) throw new Error("Failed to fetch signatures")
      const data = await response.json()
      setSignatures(data.signatures || [])
      setFilteredSignatures(data.signatures || [])
    } catch (error) {
      console.error("Error fetching NDA signatures:", error)
      toast.error("Failed to load NDA signatures")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadSignature = (url: string, name: string) => {
    window.open(url, "_blank")
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NDA Signatures</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NDA Signatures</CardTitle>
          <CardDescription>View and manage all signed Non-Disclosure Agreements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Signed At</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSignatures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {searchQuery ? "No signatures found" : "No NDA signatures yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSignatures.map((signature) => (
                    <TableRow key={signature.id}>
                      <TableCell className="font-medium">{signature.full_name}</TableCell>
                      <TableCell>{signature.email}</TableCell>
                      <TableCell>{new Date(signature.signed_at).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{signature.ip_address}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{signature.document_version}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadSignature(signature.pdf_url, signature.full_name)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredSignatures.length} of {signatures.length} signature(s)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
