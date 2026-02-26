import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, license_number, owner_name, latitude, longitude } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if pharmacy already exists
    const { data: existing, error: checkError } = await supabase
      .from("pharmacies")
      .select("id")
      .eq("email", email.toLowerCase())

    if (checkError) throw checkError
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "A pharmacy with this email already exists" }, { status: 400 })
    }

    // Insert new pharmacy into Supabase
    const { data: pharmacy, error } = await supabase
      .from("pharmacies")
      .insert([
        {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          address: address || null,
          license_number: license_number || null,
          owner_name: owner_name || null,
          latitude: latitude || null,
          longitude: longitude || null,
          paused: false,
        },
      ])
      .select()
      .single()

    if (error) throw error

    console.log("[v0] Pharmacy added to Supabase:", pharmacy.id)

    return NextResponse.json({ pharmacy, success: true })
  } catch (error: any) {
    console.error("[v0] Error adding pharmacy:", error)
    return NextResponse.json({ error: error.message || "Failed to add pharmacy" }, { status: 500 })
  }
}
