import "server-only"
import Stripe from "stripe"

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured")
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  }
  return stripeInstance
}

export async function createConnectAccount(email: string, churchName: string) {
  const stripe = getStripe()
  const account = await stripe.accounts.create({
    type: "standard",
    email,
    business_type: "non_profit",
    company: {
      name: churchName,
    },
    metadata: {
      church_name: churchName,
    },
  })

  return account
}

export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  const stripe = getStripe()
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  })

  return accountLink
}

export async function getAccountStatus(accountId: string) {
  const stripe = getStripe()
  const account = await stripe.accounts.retrieve(accountId)

  return {
    id: account.id,
    charges_enabled: account.charges_enabled,
    details_submitted: account.details_submitted,
    payouts_enabled: account.payouts_enabled,
  }
}
