import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)
    const { id } = await params
    const body = await request.json()

    if (body.payment_status === "paid" && body.total_amount) {
      const totalAmount = Number.parseFloat(body.total_amount)
      const doctorEarnings = totalAmount * 0.7 // 70% for doctor
      const platformCommission = totalAmount * 0.3 // 30% for platform

      // Update appointment with payment details and revenue split
      const result = await sql`
        UPDATE appointments
        SET 
          payment_status = ${body.payment_status},
          payment_method = ${body.payment_method || null},
          transaction_id = ${body.transaction_id || null},
          status = ${body.status || "confirmed"},
          total_amount = ${totalAmount},
          doctor_earnings = ${doctorEarnings},
          platform_commission = ${platformCommission},
          doctor_payout_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "অ্যাপয়েন্টমেন্ট পাওয়া যায়নি" }, { status: 404 })
      }

      // Get doctor_id from result
      const appointment = result[0]

      // Create doctor earnings record
      await sql`
        INSERT INTO doctor_earnings (doctor_id, appointment_id, amount, status)
        VALUES (${appointment.doctor_id}, ${id}, ${doctorEarnings}, 'pending')
      `

      // Create platform earnings record
      await sql`
        INSERT INTO platform_earnings (appointment_id, amount)
        VALUES (${id}, ${platformCommission})
      `

      return NextResponse.json({
        success: true,
        message: "পেমেন্ট সফল হয়েছে! ডাক্তার ৭০% এবং প্ল্যাটফর্ম ৩০% পাবে।",
        appointment: result[0],
        doctorEarnings,
        platformCommission,
      })
    }

    // Regular status update
    if (!body.status) {
      return NextResponse.json({ error: "স্ট্যাটাস প্রয়োজন" }, { status: 400 })
    }

    const result = await sql`
      UPDATE appointments 
      SET status = ${body.status}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "অ্যাপয়েন্টমেন্ট পাওয়া যায়নি" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "সফলভাবে আপডেট হয়েছে",
      appointment: result[0],
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "আপডেট সমস্যা হয়েছে",
      },
      { status: 500 },
    )
  }
}
