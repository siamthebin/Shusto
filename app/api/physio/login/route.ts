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

    const { data: physios, error } = await supabase
      .from("physio")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .limit(1)

    if (error || !physios || physios.length === 0) {
      return NextResponse.json({ error: "Physiotherapist not found" }, { status: 404 })
    }

    const physio = physios[0]

    return NextResponse.json({
      success: true,
      physiotherapist: {
        id: physio.id,
        name: physio.name,
        email: physio.email,
        phone: physio.phone,
        address: physio.address,
        specialization: physio.specialization,
      }
    })
  } catch (error: any) {
    console.error("[v0] Physio login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
