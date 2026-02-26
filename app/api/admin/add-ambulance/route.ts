import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, driver_name, vehicle_number, vehicle_type, service_area, address } = body

    console.log("[v0] Adding ambulance:", { name, email, phone })

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insert new ambulance into Supabase
    const { data: ambulance, error } = await supabase
      .from("ambulance")
      .insert([
        {
          name,
          email: email.toLowerCase(),
          phone,
          driver_name: driver_name || null,
          vehicle_number: vehicle_number || null,
          vehicle_type: vehicle_type || "basic",
          service_area: service_area || null,
          address: address || null,
          is_active: true,
          is_available: true,
          paused: false,
        },
      ])
      .select()
      .single()

    if (error) throw error

    console.log("[v0] Ambulance added to Supabase:", ambulance.id)
    return NextResponse.json({ success: true, ambulance }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error adding ambulance:", error)
    return NextResponse.json({ error: error.message || "Failed to add ambulance" }, { status: 500 })
  }
}
