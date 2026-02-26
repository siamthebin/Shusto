import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const status = formData.get("status")?.toString()
    const tranId = formData.get("tran_id")?.toString()
    const valId = formData.get("val_id")?.toString()
    const amount = formData.get("amount")?.toString()
    const userId = formData.get("value_a")?.toString()
    const cardType = formData.get("card_type")?.toString()

    console.log("[v0] SSLCommerz success callback:", { status, tranId, valId, amount, userId, cardType })

    if (status === "VALID" || status === "VALIDATED") {
      const supabase = await createClient()

      console.log("[v0] Payment validated - tranId:", tranId, "amount:", amount)

      // Update transaction status to completed
      if (tranId) {
        await supabase
          .from("transactions")
          .update({
            status: "completed",
            description: `SSLCommerz পেমেন্ট সফল (${cardType || "Card"})`,
          })
          .eq("reference_id", tranId)
          .catch((err) => console.error("[v0] Error updating transaction:", err))
      }

      // Update wallet balance if user exists
      if (userId && amount) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("id, balance")
          .eq("user_id", userId)
          .single()
          .catch(() => ({ data: null }))

        if (wallet) {
          await supabase
            .from("wallets")
            .update({ balance: wallet.balance + Number(amount) })
            .eq("id", wallet.id)
            .catch((err) => console.error("[v0] Error updating wallet:", err))

          console.log("[v0] Wallet updated successfully for user:", userId)
        }
      }

      // Redirect to payment success page
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${baseUrl}/payment/success?status=success&amount=${amount}&tran_id=${tranId}`,
        { status: 303 },
      )
    }

    // Payment not valid
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/payment/success?status=failed&reason=invalid`, { status: 303 })
  } catch (error: any) {
    console.error("[v0] SSLCommerz success error:", error)
    return NextResponse.redirect(`https://shusto.com/wallet?payment_status=failed&reason=error`, { status: 303 })
  }
}

export async function GET(request: NextRequest) {
  // Handle GET request as well (some gateways use GET)
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const amount = searchParams.get("amount")
  const tranId = searchParams.get("tran_id")

  if (status === "VALID" || status === "VALIDATED") {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${baseUrl}/payment/success?status=success&amount=${amount}&tran_id=${tranId}`,
      { status: 303 },
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return NextResponse.redirect(`${baseUrl}/payment/success?status=failed`, { status: 303 })
}
