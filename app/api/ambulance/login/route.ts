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

    const { data: ambulances, error } = await supabase
      .from("ambulance")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .limit(1)

    if (error || !ambulances || ambulances.length === 0) {
      console.log("[v0] Ambulance not found for email:", email)
      return NextResponse.json({ error: "Ambulance not found" }, { status: 404 })
    }

    const ambulance = ambulances[0]
    console.log("[v0] Ambulance found:", ambulance.id, ambulance.name)

    return NextResponse.json({
      success: true,
      ambulance: {
        id: ambulance.id,
        name: ambulance.name,
        email: ambulance.email,
        phone: ambulance.phone,
        address: ambulance.address,
        driver_name: ambulance.driver_name,
        vehicle_number: ambulance.vehicle_number,
      }
    })
  } catch (error: any) {
    console.error("[v0] Ambulance login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
