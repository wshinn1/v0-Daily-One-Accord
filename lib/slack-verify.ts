import crypto from "crypto"

export function verifySlackRequest(body: string, timestamp: string, signature: string, signingSecret: string): boolean {
  try {
    console.log("[v0] ===== Slack Request Verification =====")
    console.log("[v0] Signing secret exists:", !!signingSecret)
    console.log("[v0] Signing secret (first 8 chars):", signingSecret?.substring(0, 8))
    console.log("[v0] Timestamp:", timestamp)
    console.log("[v0] Signature received:", signature)
    console.log("[v0] Body length:", body.length)

    // Reject old requests (older than 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000)
    const requestTime = Number.parseInt(timestamp)
    const timeDiff = Math.abs(currentTime - requestTime)

    console.log("[v0] Current time:", currentTime)
    console.log("[v0] Request time:", requestTime)
    console.log("[v0] Time difference:", timeDiff, "seconds")

    if (timeDiff > 300) {
      console.error("[v0] ❌ Request too old:", timeDiff, "seconds (max 300)")
      return false
    }

    // Create the signature base string
    const sigBaseString = `v0:${timestamp}:${body}`
    console.log("[v0] Signature base string length:", sigBaseString.length)

    // Create HMAC SHA256 hash
    const hmac = crypto.createHmac("sha256", signingSecret)
    hmac.update(sigBaseString)
    const computedSignature = `v0=${hmac.digest("hex")}`

    console.log("[v0] Computed signature:", computedSignature)
    console.log("[v0] Received signature:", signature)
    console.log("[v0] Computed length:", computedSignature.length)
    console.log("[v0] Received length:", signature.length)

    if (computedSignature.length !== signature.length) {
      console.error("[v0] ❌ Signature length mismatch")
      console.error("[v0] Expected length:", computedSignature.length)
      console.error("[v0] Received length:", signature.length)
      return false
    }

    // Compare signatures using timing-safe comparison
    const isValid = crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(signature))

    if (isValid) {
      console.log("[v0] ✅ Signature verification PASSED")
    } else {
      console.error("[v0] ❌ Signature verification FAILED")
      console.error("[v0] This usually means:")
      console.error("[v0] 1. SLACK_SIGNING_SECRET is incorrect")
      console.error("[v0] 2. There's whitespace in the secret")
      console.error("[v0] 3. You copied the wrong secret from Slack")
    }

    return isValid
  } catch (error) {
    console.error("[v0] ❌ Slack verification error:", error)
    return false
  }
}
