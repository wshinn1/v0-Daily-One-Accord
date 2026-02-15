"use client"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"

export default function ContactPage() {
  useEffect(() => {
    // Load JotForm embed handler script
    const script = document.createElement("script")
    script.src = "https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
    script.async = true
    script.onload = () => {
      // Call the embed handler after script loads
      if (typeof window !== "undefined" && (window as any).jotformEmbedHandler) {
        ;(window as any).jotformEmbedHandler("iframe[id='JotFormIFrame-252945426138058']", "https://form.jotform.com/")
      }
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Contact Us
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Get in touch</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <iframe
              id="JotFormIFrame-252945426138058"
              title="Contact Daily One Accord"
              allowTransparency={true}
              allow="geolocation; microphone; camera; fullscreen; payment"
              src="https://form.jotform.com/252945426138058"
              style={{
                minWidth: "100%",
                maxWidth: "100%",
                height: "539px",
                border: "none",
              }}
              scrolling="no"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
