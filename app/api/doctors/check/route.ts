import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    console.log("[v0] 🔍 Doctor check API called for email:", email)

    if (!email) {
      console.log("[v0] ❌ No email provided")
      return NextResponse.json({ isDoctor: false, error: "Email required" }, { status: 400 })
    }

    if (!process.env.NEON_POSTGRES_URL) {
      console.error("[v0] ❌ NEON_POSTGRES_URL not configured")
      return NextResponse.json({ isDoctor: false, error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(process.env.NEON_POSTGRES_URL)

    const doctors = await sql`
      SELECT id, email, name
      FROM doctors 
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `

    const isDoctor = doctors.length > 0

    console.log("[v0] 🔍 Doctor check result - Email:", email, "Is Doctor:", isDoctor)
    if (isDoctor) {
      console.log("[v0] 👨‍⚕️ Doctor found:", doctors[0])
    }

    return NextResponse.json({ isDoctor })
  } catch (error) {
    console.error("[v0] ❌ Check doctor API error:", error)
    return NextResponse.json({ isDoctor: false, error: "Database error" }, { status: 500 })
  }
}
