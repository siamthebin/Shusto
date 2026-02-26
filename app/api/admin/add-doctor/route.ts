import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, specialty, bmdcNumber, experience, price, photoUrl } = body

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const existingDoctor = await sql`
      SELECT id, name FROM doctors WHERE email = ${email}
    `

    if (existingDoctor.length > 0) {
      return NextResponse.json({ error: "এই ইমেইল দিয়ে ইতিমধ্যে একজন ডাক্তার আছে" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO doctors (name, email, specialty, bmdc_number, experience_years, consultation_fee, photo_url, verification_status)
      VALUES (${name}, ${email}, ${specialty}, ${bmdcNumber || ""}, ${Number.parseInt(experience) || 1}, ${Number.parseInt(price) || 500}, ${photoUrl || null}, 'approved')
      RETURNING id, name, email, specialty
    `

    return NextResponse.json({
      success: true,
      message: "ডাক্তার সফলভাবে যোগ করা হয়েছে",
      data: result[0],
    })
  } catch (error: any) {
    console.error("[v0] Error adding doctor:", error)
    if (error.message?.includes("duplicate key") || error.message?.includes("unique")) {
      return NextResponse.json({ error: "এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে" }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || "অজানা ত্রুটি ঘটেছে" }, { status: 500 })
  }
}
