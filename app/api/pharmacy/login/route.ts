import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const pharmacies = await sql`
      SELECT * FROM pharmacies WHERE email = ${email} AND is_active = true LIMIT 1
    `

    if (!pharmacies || pharmacies.length === 0) {
      return NextResponse.json({ error: "Pharmacy not found" }, { status: 404 })
    }

    const pharmacy = pharmacies[0]
    console.log("[v0] Pharmacy found:", pharmacy.id, pharmacy.name)

    // Create response with pharmacy data
    const response = NextResponse.json({
      success: true,
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        email: pharmacy.email,
        phone: pharmacy.phone,
        address: pharmacy.address,
        license_number: pharmacy.license_number,
      }
    })

    // Set secure HTTP-only cookie for session
    response.cookies.set('pharmacyAuth', JSON.stringify({
      id: pharmacy.id,
      email: pharmacy.email,
      name: pharmacy.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[v0] Pharmacy login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
