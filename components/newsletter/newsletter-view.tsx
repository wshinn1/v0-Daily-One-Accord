"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { NewsletterList } from "./newsletter-list"
import { CreateNewsletterDialog } from "./create-newsletter-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Newsletter {
  id: string
  subject: string
  content: string
  sent_at: string | null
  created_by: { full_name: string }
  created_at: string
  newsletter_recipients: Array<{ id: string }>
}

interface Contact {
  id: string
  email: string
  full_name: string
}

interface NewsletterViewProps {
  newsletters: Newsletter[]
  members: Contact[]
  visitors: Contact[]
  churchTenantId: string
  userId: string
}

export function NewsletterView({
  newsletters: initialNewsletters,
  members,
  visitors,
  churchTenantId,
  userId,
}: NewsletterViewProps) {
  const [newsletters, setNewsletters] = useState(initialNewsletters)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  const handleCreateNewsletter = async (newsletterData: any) => {
    const { data, error } = await supabase
      .from("newsletters")
      .insert({
        ...newsletterData,
        church_tenant_id: churchTenantId,
        created_by: userId,
      })
      .select("*, created_by:users(full_name), newsletter_recipients(id)")
      .single()

    if (!error && data) {
      setNewsletters([data, ...newsletters])
    }

    return { data, error }
  }

  const handleDeleteNewsletter = async (id: string) => {
    const { error } = await supabase.from("newsletters").delete().eq("id", id)

    if (!error) {
      setNewsletters(newsletters.filter((n) => n.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Newsletter</h2>
          <p className="text-muted-foreground">Create and send email newsletters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/newsletter/builder")}>
            <Plus className="w-4 h-4 mr-2" />
            Build Email Template
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Newsletter
          </Button>
        </div>
      </div>

      <NewsletterList newsletters={newsletters} onDelete={handleDeleteNewsletter} />

      <CreateNewsletterDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateNewsletter}
        members={members}
        visitors={visitors}
      />
    </div>
  )
}
