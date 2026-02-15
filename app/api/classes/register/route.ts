import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { classId, studentName, studentAge, parentName, parentEmail, parentPhone, notes } = body

    // Validate required fields
    if (!classId || !studentName || !parentName || !parentEmail || !parentPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if class exists and is active
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("*, church_tenants(name)")
      .eq("id", classId)
      .eq("is_active", true)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: "Class not found or inactive" }, { status: 404 })
    }

    // Check capacity
    const { count: enrollmentCount } = await supabase
      .from("class_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("status", "active")

    if (classData.capacity && enrollmentCount && enrollmentCount >= classData.capacity) {
      return NextResponse.json({ error: "Class is full" }, { status: 400 })
    }

    // Create enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("class_enrollments")
      .insert({
        class_id: classId,
        student_name: studentName,
        student_age: studentAge ? Number.parseInt(studentAge) : null,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        notes: notes || null,
        status: "active",
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (enrollmentError) {
      console.error("Enrollment error:", enrollmentError)
      return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
    }

    // TODO: Send confirmation email to parent

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
