"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Phone, DollarSign, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Donor {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  total_donated: number
  donation_count: number
  last_donation_date: string | null
  created_at: string
}

export function DonorManagement() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      const response = await fetch("/api/giving/donors")
      if (response.ok) {
        const data = await response.json()
        setDonors(data.donors || [])
      }
    } catch (error) {
      console.error("Failed to fetch donors:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDonors = donors.filter((donor) => {
    const query = searchQuery.toLowerCase()
    return (
      donor.email.toLowerCase().includes(query) ||
      donor.first_name?.toLowerCase().includes(query) ||
      donor.last_name?.toLowerCase().includes(query)
    )
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return <div>Loading donors...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Donor Management</h1>
        <p className="text-muted-foreground">View and manage your church donors</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donors</CardTitle>
          <CardDescription>{donors.length} total donors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search donors by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Donated</TableHead>
                  <TableHead>Donations</TableHead>
                  <TableHead>Last Gift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No donors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {donor.first_name && donor.last_name
                              ? `${donor.first_name} ${donor.last_name}`
                              : "Anonymous"}
                          </div>
                          <div className="text-sm text-muted-foreground">{donor.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {donor.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <span className="text-muted-foreground">{donor.email}</span>
                            </div>
                          )}
                          {donor.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <span className="text-muted-foreground">{donor.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          {formatCurrency(donor.total_donated)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {donor.donation_count} {donor.donation_count === 1 ? "gift" : "gifts"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(donor.last_donation_date)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
