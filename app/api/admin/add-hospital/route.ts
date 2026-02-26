import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, emergency_number, specialties, bed_count } = body

    console.log("[v0] Adding hospital:", { name, email, phone, address })

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insert new hospital into Supabase
    const specialtiesArray = Array.isArray(specialties) ? specialties : null

    const { data: hospital, error } = await supabase
      .from("hospitals")
      .insert([
        {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          address: address || null,
          emergency_number: emergency_number || null,
          specialties: specialtiesArray,
          bed_count: bed_count || 0,
          is_active: true,
          paused: false,
        },
      ])
      .select()
      .single()

    if (error) throw error

    console.log("[v0] Hospital added to Supabase:", hospital.id)
    return NextResponse.json({ success: true, hospital }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error adding hospital:", error)
    return NextResponse.json({ error: error.message || "Failed to add hospital" }, { status: 500 })
  }
}
