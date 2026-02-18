import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)

    const labs = await sql`SELECT * FROM labs ORDER BY created_at DESC`

    return NextResponse.json({ labs })
  } catch (error: any) {
    console.error("[v0] Error fetching labs:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch labs" }, { status: 500 })
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

    await sql`DELETE FROM labs WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting lab:", error)
    return NextResponse.json({ error: error.message || "Failed to delete lab" }, { status: 500 })
  }
}
