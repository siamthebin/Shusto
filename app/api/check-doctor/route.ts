import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ isDoctor: false })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const doctors = await sql`
      SELECT id FROM doctors WHERE email = ${email} LIMIT 1
    `

    return NextResponse.json({ isDoctor: doctors.length > 0 })
  } catch (error) {
    console.error("[v0] Error checking doctor:", error)
    return NextResponse.json({ isDoctor: false })
  }
}
