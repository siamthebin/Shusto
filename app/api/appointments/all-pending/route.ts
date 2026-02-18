import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.NEON_DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_POSTGRES_URL

    if (!connectionString) {
      console.error("Database connection string not found")
      return NextResponse.json([], { status: 200 })
    }

    const sql = neon(connectionString)

    // Fetch all pending appointments
    const appointments = await sql`
      SELECT * FROM appointments
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `

    console.log(`[v0] Fetched ${appointments.length} pending appointments`)

    return NextResponse.json(appointments || [])
  } catch (error) {
    console.error("API GET Error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
