import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, license_number, owner_name, services } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insert new lab into Supabase
    const { data: lab, error } = await supabase
      .from("labs")
      .insert([
        {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          address: address || null,
          license_number: license_number || null,
          owner_name: owner_name || null,
          services: services || null,
          paused: false,
        },
      ])
      .select()
      .single()

    if (error) throw error

    console.log("[v0] Lab added to Supabase:", lab.id)
    return NextResponse.json({ success: true, lab }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error adding lab:", error)
    return NextResponse.json({ error: error.message || "Failed to add lab" }, { status: 500 })
  }
}
