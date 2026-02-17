import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { hospitalId, isPaused } = await request.json()

    if (!hospitalId) {
      return NextResponse.json({ error: "Hospital ID is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const result = await sql`
      UPDATE hospitals SET is_paused = ${isPaused} WHERE id = ${hospitalId} RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: isPaused ? "Hospital service paused" : "Hospital service resumed",
      hospital: result[0],
    })
  } catch (error: any) {
    console.error("[v0] Error toggling hospital pause:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
