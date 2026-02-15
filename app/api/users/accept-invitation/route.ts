import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { invitationId, userId } = await request.json()

    console.log("[v0] 🔵 ACCEPT INVITATION: Starting for user:", userId)

    if (!invitationId || !userId) {
      return NextResponse.json({ error: "Invitation ID and user ID are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("id", invitationId)
      .single()

    if (inviteError || !invitation) {
      console.error("[v0] 🔴 ACCEPT INVITATION: Invitation not found:", inviteError)
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    console.log("[v0] 🟢 ACCEPT INVITATION: Found invitation for church:", invitation.church_tenant_id)

    console.log("[v0] 🔵 ACCEPT INVITATION: Updating user role to:", invitation.role)
    const { error: roleError } = await supabase.from("users").update({ role: invitation.role }).eq("id", userId)

    if (roleError) {
      console.error("[v0] 🔴 ACCEPT INVITATION: Error updating user role:", roleError)
      // Don't fail the whole process if role update fails
    } else {
      console.log("[v0] 🟢 ACCEPT INVITATION: User role updated successfully")
    }

    // Check if user is a removed member
    const { data: member, error: memberError } = await supabase
      .from("church_members")
      .select("id, removed_at")
      .eq("user_id", userId)
      .eq("church_tenant_id", invitation.church_tenant_id)
      .single()

    if (memberError && memberError.code !== "PGRST116") {
      console.error("[v0] 🔴 ACCEPT INVITATION: Error checking member:", memberError)
      return NextResponse.json({ error: "Failed to check member status" }, { status: 500 })
    }

    if (member && member.removed_at) {
      // User was removed, re-add them by clearing removed_at
      console.log("[v0] 🟡 ACCEPT INVITATION: User was removed, re-adding to church...")

      const { error: updateError } = await supabase
        .from("church_members")
        .update({
          removed_at: null,
          role: invitation.role,
        })
        .eq("id", member.id)

      if (updateError) {
        console.error("[v0] 🔴 ACCEPT INVITATION: Error re-adding user:", updateError)
        return NextResponse.json({ error: "Failed to re-add user to church" }, { status: 500 })
      }

      console.log("[v0] 🟢 ACCEPT INVITATION: User re-added successfully")
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from("user_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitationId)

    if (acceptError) {
      console.error("[v0] 🔴 ACCEPT INVITATION: Error marking invitation as accepted:", acceptError)
      return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 })
    }

    console.log("[v0] 🟢 ACCEPT INVITATION: Invitation accepted successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] 🔴 ACCEPT INVITATION: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
