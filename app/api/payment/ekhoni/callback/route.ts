import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const EKHONI_API_KEY =
  process.env.EKHONI_API_KEY || process.env.EKHONI_BRAND_KEY || "WXO5tXMnKlBRpW5F9rG6PpB9XCYsa3MjWrYzSAroaYhQWhgCcA"

const PAYMENT_DOMAIN = "https://payment.shusto.com"
const MAIN_DOMAIN = "https://shusto.com"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const amount = searchParams.get("amount")
    const provider = searchParams.get("provider")

    const body = await request.json()
    console.log("[v0] Payment callback received:", { orderId, amount, provider, body })

    const supabase = await createClient()

    // Find the pending transaction by order ID
    const { data: transaction } = await supabase
      .from("transactions")
      .select("*, wallets(user_id)")
      .eq("reference_id", orderId)
      .eq("status", "pending")
      .single()

    if (transaction && (body.status === "success" || body.status === "completed" || body.status === 1)) {
      // Get wallet
      const { data: wallet } = await supabase.from("wallets").select("*").eq("id", transaction.wallet_id).single()

      if (wallet) {
        const paymentAmount = Number(amount)
        const newBalance = (wallet.balance || 0) + paymentAmount

        await supabase
          .from("wallets")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("id", wallet.id)

        // Update transaction status
        await supabase
          .from("transactions")
          .update({
            status: "completed",
            description: `${provider === "bkash" ? "bKash" : "Nagad"} রিচার্জ সফল`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.id)

        console.log("[v0] Callback: Wallet updated in Supabase. New balance:", newBalance)
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: "Invalid callback" })
  } catch (error) {
    console.error("[v0] Callback error:", error)
    return NextResponse.json({ success: false, error: "Callback failed" }, { status: 500 })
  }
}

// Handle GET requests for callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get("orderId")
  const amount = searchParams.get("amount")
  const provider = searchParams.get("provider")
  const status = searchParams.get("status")

  console.log("[v0] GET Callback received:", { orderId, amount, provider, status })

  if (status === "success" || status === "Success") {
    // Redirect to success handler on payment domain
    return NextResponse.redirect(
      `${PAYMENT_DOMAIN}/api/payment/ekhoni/success?orderId=${orderId}&amount=${amount}&provider=${provider}`,
    )
  }

  return NextResponse.redirect(`${MAIN_DOMAIN}/wallet?payment_status=failed`)
}
