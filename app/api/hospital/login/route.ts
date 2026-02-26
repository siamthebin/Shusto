import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: hospitals, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .limit(1)

    if (error || !hospitals || hospitals.length === 0) {
      console.log("[v0] Hospital not found for email:", email)
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }

    const hospital = hospitals[0]
    console.log("[v0] Hospital found:", hospital.id, hospital.name)

    return NextResponse.json({
      success: true,
      hospital: {
        id: hospital.id,
        name: hospital.name,
        email: hospital.email,
        phone: hospital.phone,
        address: hospital.address,
        emergency_number: hospital.emergency_number,
      }
    })
  } catch (error: any) {
    console.error("[v0] Hospital login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
