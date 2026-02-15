import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface RelatedPage {
  title: string
  description: string
  href: string
}

interface RelatedPagesProps {
  pages: RelatedPage[]
  title?: string
}

export function RelatedPages({ pages, title = "Related Pages" }: RelatedPagesProps) {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pages.map((page) => (
            <Link key={page.href} href={page.href} className="group">
              <Card className="p-6 h-full hover:shadow-lg transition-all hover:border-primary">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{page.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{page.description}</p>
                <div className="flex items-center text-sm text-primary font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
