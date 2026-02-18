import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const physios = await sql`
      SELECT * FROM physiotherapists WHERE email = ${email} AND is_active = true LIMIT 1
    `

    if (!physios || physios.length === 0) {
      return NextResponse.json({ error: "Physiotherapist not found" }, { status: 404 })
    }

    const physio = physios[0]

    // Create response with physiotherapist data
    const response = NextResponse.json({
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

    // Set secure HTTP-only cookie for session
    response.cookies.set('physioAuth', JSON.stringify({
      id: physio.id,
      email: physio.email,
      name: physio.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[v0] Physio login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
