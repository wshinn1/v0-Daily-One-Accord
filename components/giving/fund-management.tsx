"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Fund {
  id: string
  name: string
  description: string | null
  is_default: boolean
  is_active: boolean
  total_amount: number
}

export function FundManagement() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFund, setEditingFund] = useState<Fund | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_default: false,
  })

  useEffect(() => {
    fetchFunds()
  }, [])

  const fetchFunds = async () => {
    try {
      const response = await fetch("/api/giving/funds")
      const data = await response.json()
      setFunds(data.funds || [])
    } catch (error) {
      console.error("[v0] Failed to fetch funds:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingFund ? `/api/giving/funds/${editingFund.id}` : "/api/giving/funds"

      const response = await fetch(url, {
        method: editingFund ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchFunds()
        setDialogOpen(false)
        setEditingFund(null)
        setFormData({ name: "", description: "", is_default: false })
      }
    } catch (error) {
      console.error("[v0] Failed to save fund:", error)
    }
  }

  const handleEdit = (fund: Fund) => {
    setEditingFund(fund)
    setFormData({
      name: fund.name,
      description: fund.description || "",
      is_default: fund.is_default,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (fundId: string) => {
    if (!confirm("Are you sure you want to delete this fund?")) return

    try {
      const response = await fetch(`/api/giving/funds/${fundId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchFunds()
      }
    } catch (error) {
      console.error("[v0] Failed to delete fund:", error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Giving Funds</h1>
          <p className="text-muted-foreground mt-2">Manage funds that donors can give to</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingFund(null)
                setFormData({ name: "", description: "", is_default: false })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Fund
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFund ? "Edit Fund" : "Create Fund"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Fund Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="General Fund"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label htmlFor="is_default">Set as default fund</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingFund ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {funds.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No funds yet. Create your first fund to get started.</p>
          </Card>
        ) : (
          funds.map((fund) => (
            <Card key={fund.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{fund.name}</h3>
                    {fund.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>
                    )}
                  </div>
                  {fund.description && <p className="text-sm text-muted-foreground mt-1">{fund.description}</p>}
                  <p className="text-sm font-medium mt-2">Total: ${(fund.total_amount / 100).toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(fund)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(fund.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
