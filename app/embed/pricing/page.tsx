import { EmbeddablePricingWidget } from "@/components/pricing/embeddable-pricing-widget"

export default function EmbedPricingPage({ searchParams }: { searchParams: { config?: string } }) {
  // Parse config from URL or use defaults
  const defaultConfig = {
    primaryColor: "#3b82f6",
    accentColor: "#10b981",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    borderRadius: "8",
    showComparison: true,
    showMonthlyOnly: true,
    highlightPlan: "growth",
  }

  let config = defaultConfig
  if (searchParams.config) {
    try {
      config = { ...defaultConfig, ...JSON.parse(decodeURIComponent(searchParams.config)) }
    } catch (e) {
      console.error("Failed to parse config:", e)
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: config.backgroundColor }}>
      <EmbeddablePricingWidget config={config} />
    </div>
  )
}
