import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, specialization, experience_years, consultation_fee, qualification } = body

    console.log("[v0] Adding physio:", { name, email, phone })

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insert new physiotherapist into Supabase
    const { data: physiotherapist, error } = await supabase
      .from("physio")
      .insert([
        {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          address: address || null,
          specialization: specialization || null,
          experience_years: experience_years || null,
          consultation_fee: consultation_fee || 500,
          qualification: qualification || null,
          is_active: true,
          is_available: true,
          paused: false,
        },
      ])
      .select()
      .single()

    if (error) throw error

    console.log("[v0] Physio added to Supabase:", physiotherapist.id)
    return NextResponse.json({ success: true, physiotherapist }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error adding physiotherapist:", error)
    return NextResponse.json({ error: error.message || "Failed to add physiotherapist" }, { status: 500 })
  }
}
