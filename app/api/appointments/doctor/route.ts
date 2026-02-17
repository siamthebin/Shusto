import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctor_email = searchParams.get("doctor_email")

    if (!doctor_email) {
      return NextResponse.json([], { status: 200 })
    }

    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!)

    // First get the doctor's ID using their email
    const doctors = await sql`
      SELECT id, name FROM doctors WHERE email = ${doctor_email} LIMIT 1
    `

    if (!doctors || doctors.length === 0) {
      console.error("[v0] Doctor not found:", doctor_email)
      return NextResponse.json([], { status: 200 })
    }

    const doctorId = doctors[0].id
    console.log("[v0] Fetching appointments for Doctor ID:", doctorId)

    // Fetch appointments directly from DB
    const appointments = await sql`
      SELECT * FROM appointments 
      WHERE doctor_id = ${doctorId} 
      ORDER BY created_at DESC
    `

    return NextResponse.json(appointments || [])
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
