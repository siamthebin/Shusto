import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, status } = body

    if (!appointmentId || !status) {
      return NextResponse.json({ error: "appointmentId and status required" }, { status: 400 })
    }

    const connectionString =
      process.env.DATABASE_URL ||
      process.env.NEON_DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_POSTGRES_URL

    if (!connectionString) {
      throw new Error("Database connection string not found")
    }

    const sql = neon(connectionString)

    await sql`
      UPDATE appointments
      SET status = ${status}
      WHERE id = ${appointmentId}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Update Status Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
