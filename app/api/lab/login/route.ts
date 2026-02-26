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

    const { data: labs, error } = await supabase
      .from("labs")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .limit(1)

    if (error || !labs || labs.length === 0) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 })
    }

    const lab = labs[0]

    return NextResponse.json({
      success: true,
      lab: {
        id: lab.id,
        name: lab.name,
        email: lab.email,
        phone: lab.phone,
        address: lab.address,
        license_number: lab.license_number,
      }
    })
  } catch (error: any) {
    console.error("[v0] Lab login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
