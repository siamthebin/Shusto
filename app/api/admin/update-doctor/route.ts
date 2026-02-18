import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, email, specialty, bmdcNumber, experience, price, photoUrl } = body

    console.log("[v0] Update doctor request:", { id, hasPhotoUrl: !!photoUrl, photoUrlLength: photoUrl?.length })

    if (!id) {
      return NextResponse.json({ error: "Doctor ID required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const result = await sql`
      UPDATE doctors 
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        specialty = COALESCE(${specialty}, specialty),
        bmdc_number = COALESCE(${bmdcNumber}, bmdc_number),
        experience_years = COALESCE(${experience ? Number.parseInt(experience) : null}, experience_years),
        consultation_fee = COALESCE(${price ? Number.parseInt(price) : null}, consultation_fee),
        photo_url = ${photoUrl || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    console.log("[v0] Update result:", result.length > 0 ? "Success" : "No rows updated")

    if (result.length === 0) {
      return NextResponse.json({ error: "ডাক্তার খুঁজে পাওয়া যায়নি" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "ডাক্তার সফলভাবে আপডেট করা হয়েছে",
      data: result[0],
    })
  } catch (error: any) {
    console.error("[v0] Error updating doctor:", error)
    return NextResponse.json({ error: error.message || "অজানা ত্রুটি ঘটেছে" }, { status: 500 })
  }
}
