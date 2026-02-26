import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const paymentID = searchParams.get("paymentID")
  const appointmentId = searchParams.get("appointmentId")
  const amount = searchParams.get("amount")

  // If appointment payment, update appointment
  if (appointmentId && amount && status === "success") {
    try {
      const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

      if (connectionString) {
        const sql = neon(connectionString)

        // Update appointment with revenue split
        const totalAmount = Number.parseFloat(amount)
        const doctorEarnings = totalAmount * 0.7
        const platformCommission = totalAmount * 0.3

        await sql`
          UPDATE appointments
          SET 
            payment_status = 'paid',
            payment_method = 'bkash',
            transaction_id = ${paymentID},
            status = 'confirmed',
            total_amount = ${totalAmount},
            doctor_earnings = ${doctorEarnings},
            platform_commission = ${platformCommission},
            doctor_payout_status = 'pending',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${appointmentId}
        `

        // Get doctor_id
        const appointment = await sql`
          SELECT doctor_id FROM appointments WHERE id = ${appointmentId}
        `

        if (appointment[0]) {
          // Create earnings records
          await sql`
            INSERT INTO doctor_earnings (doctor_id, appointment_id, amount, status)
            VALUES (${appointment[0].doctor_id}, ${appointmentId}, ${doctorEarnings}, 'pending')
          `

          await sql`
            INSERT INTO platform_earnings (appointment_id, amount)
            VALUES (${appointmentId}, ${platformCommission})
          `
        }
      }

      // Redirect to patient dashboard with success
      const redirectUrl = new URL("/dashboard/patient", request.url)
      redirectUrl.searchParams.set("payment", "success")
      return NextResponse.redirect(redirectUrl)
    } catch (error) {
      console.error("[v0] bKash callback error:", error)
    }
  }

  // Wallet recharge redirect
  const redirectUrl = new URL("/wallet", request.url)
  redirectUrl.searchParams.set("payment_status", status || "unknown")
  redirectUrl.searchParams.set("payment_id", paymentID || "")
  redirectUrl.searchParams.set("method", "bkash")

  return NextResponse.redirect(redirectUrl)
}
