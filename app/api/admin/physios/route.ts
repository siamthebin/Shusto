import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)

    const physios = await sql`SELECT * FROM physiotherapists ORDER BY created_at DESC`

    return NextResponse.json({ physios })
  } catch (error: any) {
    console.error("[v0] Error fetching physiotherapists:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch physiotherapists" }, { status: 500 })
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

    await sql`DELETE FROM physiotherapists WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting physiotherapist:", error)
    return NextResponse.json({ error: error.message || "Failed to delete physiotherapist" }, { status: 500 })
  }
}
