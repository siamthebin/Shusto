import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const ambulances = await sql`
      SELECT * FROM ambulances WHERE email = ${email} AND is_active = true LIMIT 1
    `

    if (!ambulances || ambulances.length === 0) {
      console.log("[v0] Ambulance not found for email:", email)
      return NextResponse.json({ error: "Ambulance not found" }, { status: 404 })
    }

    const ambulance = ambulances[0]
    console.log("[v0] Ambulance found:", ambulance.id, ambulance.name)

    // Create response with ambulance data
    const response = NextResponse.json({
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

    // Set secure HTTP-only cookie for session
    response.cookies.set('ambulanceAuth', JSON.stringify({
      id: ambulance.id,
      email: ambulance.email,
      name: ambulance.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[v0] Ambulance login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
