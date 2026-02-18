import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    // Find hospital by email
    const hospitals = await sql`
      SELECT * FROM hospitals WHERE email = ${email} AND is_active = true LIMIT 1
    `

    if (!hospitals || hospitals.length === 0) {
      console.log("[v0] Hospital not found for email:", email)
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }

    const hospital = hospitals[0]
    console.log("[v0] Hospital found:", hospital.id, hospital.name)
    console.log("[v0] Hospital data:", hospital)

    // Create response with hospital data
    const response = NextResponse.json({
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

    // Set secure HTTP-only cookie for session
    response.cookies.set('hospitalAuth', JSON.stringify({
      id: hospital.id,
      email: hospital.email,
      name: hospital.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[v0] Hospital login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
