import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  try {
    const { attachmentId } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get attachment to delete from blob storage
    const { data: attachment } = await supabase
      .from("visitor_attachments")
      .select("file_url")
      .eq("id", attachmentId)
      .eq("user_id", user.id)
      .single()

    if (attachment?.file_url) {
      try {
        await del(attachment.file_url)
      } catch (blobError) {
        console.error("[v0] Error deleting from blob storage:", blobError)
      }
    }

    // Delete from database
    const { error } = await supabase.from("visitor_attachments").delete().eq("id", attachmentId).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error deleting attachment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Exception in DELETE /api/visitors/[id]/attachments/[attachmentId]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
