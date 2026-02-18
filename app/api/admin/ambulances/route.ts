import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)

    const ambulances = await sql`SELECT * FROM ambulances ORDER BY created_at DESC`

    return NextResponse.json({ ambulances })
  } catch (error: any) {
    console.error("[v0] Error fetching ambulances:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch ambulances" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    await sql`DELETE FROM ambulances WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting ambulance:", error)
    return NextResponse.json({ error: error.message || "Failed to delete ambulance" }, { status: 500 })
  }
}
