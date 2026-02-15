"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Heart, Loader2, AlertCircle } from "lucide-react"

interface Fund {
  id: string
  name: string
  description: string | null
  color: string | null
}

interface DonationFormProps {
  churchTenantId: string
  campaignId?: string
  funds?: Fund[]
  suggestedAmounts?: number[]
  allowRecurring?: boolean
  allowAnonymous?: boolean
  allowNotes?: boolean
  minimumAmount?: number
  primaryColor?: string
}

export function DonationForm({
  churchTenantId,
  campaignId,
  funds = [],
  suggestedAmounts = [2500, 5000, 10000, 25000],
  allowRecurring = true,
  allowAnonymous = true,
  allowNotes = true,
  minimumAmount = 100,
  primaryColor,
}: DonationFormProps) {
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [fundId, setFundId] = useState<string>("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringInterval, setRecurringInterval] = useState("monthly")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donorNote, setDonorNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Donor information
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  const selectedAmount = amount || (customAmount ? Number.parseFloat(customAmount) * 100 : null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedAmount || selectedAmount < minimumAmount) {
      newErrors.amount = `Minimum donation amount is $${(minimumAmount / 100).toFixed(2)}`
    }

    if (selectedAmount && selectedAmount > 100000000) {
      newErrors.amount = "Maximum donation amount is $1,000,000"
    }

    if (!fundId && funds.length > 0) {
      newErrors.fund = "Please select a fund"
    }

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!firstName) {
      newErrors.firstName = "First name is required"
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    setErrors({})

    try {
      // Create donation intent
      const response = await fetch("/api/giving/donations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          fundId: fundId || null,
          campaignId: campaignId || null,
          isRecurring,
          recurringInterval: isRecurring ? recurringInterval : null,
          isAnonymous,
          donorNote: donorNote.substring(0, 500), // Client-side sanitization
          donor: {
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ submit: data.error || "Failed to create donation" })
        return
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error("[v0] Donation creation error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Failed to process donation" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      {/* Amount Selection */}
      <div className="space-y-3">
        <Label>Select Amount</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {suggestedAmounts.map((amt) => (
            <Button
              key={amt}
              type="button"
              variant={amount === amt ? "default" : "outline"}
              onClick={() => {
                setAmount(amt)
                setCustomAmount("")
                setErrors((prev) => ({ ...prev, amount: "" }))
              }}
              className="h-14 md:h-16 text-base md:text-lg font-semibold touch-manipulation min-h-[48px]"
            >
              ${(amt / 100).toFixed(0)}
            </Button>
          ))}
        </div>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setAmount(null)
              setErrors((prev) => ({ ...prev, amount: "" }))
            }}
            className="pl-10 h-12 text-lg"
            min={minimumAmount / 100}
            step="0.01"
            aria-label="Custom donation amount"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-error" : undefined}
          />
        </div>
        {errors.amount && (
          <p id="amount-error" className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.amount}
          </p>
        )}
      </div>

      {/* Fund Selection */}
      {funds.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="fund">Give To *</Label>
          <Select
            value={fundId}
            onValueChange={(value) => {
              setFundId(value)
              setErrors((prev) => ({ ...prev, fund: "" }))
            }}
          >
            <SelectTrigger
              id="fund"
              className="h-12"
              aria-invalid={!!errors.fund}
              aria-describedby={errors.fund ? "fund-error" : undefined}
            >
              <SelectValue placeholder="Select a fund" />
            </SelectTrigger>
            <SelectContent>
              {funds.map((fund) => (
                <SelectItem key={fund.id} value={fund.id}>
                  <div className="flex items-center gap-2">
                    {fund.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fund.color }} />}
                    <span>{fund.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fund && (
            <p id="fund-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.fund}
            </p>
          )}
        </div>
      )}

      {/* Recurring Option */}
      {allowRecurring && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="recurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              className="min-h-[24px] min-w-[24px]"
            />
            <Label htmlFor="recurring" className="cursor-pointer">
              Make this a recurring donation
            </Label>
          </div>
          {isRecurring && (
            <Select value={recurringInterval} onValueChange={setRecurringInterval}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </Card>
      )}

      {/* Donor Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Your Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                setErrors((prev) => ({ ...prev, firstName: "" }))
              }}
              required
              className="h-12"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.firstName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                setErrors((prev) => ({ ...prev, lastName: "" }))
              }}
              required
              className="h-12"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((prev) => ({ ...prev, email: "" }))
            }}
            required
            className="h-12"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" />
        </div>
      </div>

      {/* Anonymous Option */}
      {allowAnonymous && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            className="min-h-[24px] min-w-[24px]"
          />
          <Label htmlFor="anonymous" className="cursor-pointer">
            Make this donation anonymous
          </Label>
        </div>
      )}

      {/* Donor Note */}
      {allowNotes && (
        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            value={donorNote}
            onChange={(e) => setDonorNote(e.target.value)}
            placeholder="Add a message with your donation..."
            rows={3}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{donorNote.length}/500</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg touch-manipulation min-h-[48px]"
        disabled={isProcessing || !selectedAmount || (funds.length > 0 && !fundId)}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Heart className="mr-2 h-5 w-5" />
            {isRecurring ? "Set Up Recurring Gift" : "Complete Donation"}
          </>
        )}
      </Button>

      {selectedAmount && (
        <p className="text-center text-sm text-muted-foreground">
          You're giving ${(selectedAmount / 100).toFixed(2)}
          {isRecurring && ` ${recurringInterval}`}
        </p>
      )}
    </form>
  )
}
