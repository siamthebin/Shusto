import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const labId = searchParams.get('labId')

    if (!labId) {
      return NextResponse.json({ error: "Lab ID is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const orders = await sql`
      SELECT id, customer_name, customer_phone, total_amount, status, created_at 
      FROM orders 
      WHERE assigned_lab_id = ${labId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error("[v0] Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
