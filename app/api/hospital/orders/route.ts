import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')

    if (!hospitalId) {
      return NextResponse.json({ error: "Hospital ID is required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    // Fetch orders assigned to this hospital
    const orders = await sql`
      SELECT id, customer_name, customer_phone, total_amount, status, created_at 
      FROM orders 
      WHERE assigned_hospital_id = ${hospitalId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    console.log("[v0] Orders found for hospital:", orders.length)
    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error("[v0] Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
