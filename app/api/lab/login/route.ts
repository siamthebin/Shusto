import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const labs = await sql`
      SELECT * FROM labs WHERE email = ${email} AND is_active = true LIMIT 1
    `

    if (!labs || labs.length === 0) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 })
    }

    const lab = labs[0]

    // Create response with lab data
    const response = NextResponse.json({
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

    // Set secure HTTP-only cookie for session
    response.cookies.set('labAuth', JSON.stringify({
      id: lab.id,
      email: lab.email,
      name: lab.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[v0] Lab login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
