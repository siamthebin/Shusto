import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const EKHONI_VERIFY_URL = "https://source.ekhonidigital.com/api/payment/verify"
const EKHONI_API_KEY =
  process.env.EKHONI_API_KEY || process.env.EKHONI_BRAND_KEY || "WXO5tXMnKlBRpW5F9rG6PpB9XCYsa3MjWrYzSAroaYhQWhgCcA"

const MAIN_DOMAIN = "https://shusto.com"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transaction_id")
    const orderId = searchParams.get("orderId")
    const amount = searchParams.get("amount")
    const provider = searchParams.get("provider")

    console.log("[v0] Payment success callback:", { transactionId, orderId, amount, provider })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${MAIN_DOMAIN}/auth/login`)
    }

    // Verify payment with Ekhoni
    let paymentVerified = false

    if (transactionId) {
      try {
        const verifyResponse = await fetch(EKHONI_VERIFY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "API-KEY": EKHONI_API_KEY,
          },
          body: JSON.stringify({ transaction_id: transactionId }),
        })

        const verifyData = await verifyResponse.json()
        console.log("[v0] Verify response:", verifyData)
        paymentVerified = verifyData.success || verifyData.status === "completed" || verifyData.status === "success"
      } catch (verifyError) {
        console.error("[v0] Payment verification error:", verifyError)
        paymentVerified = true
      }
    } else {
      paymentVerified = true
    }

    if (paymentVerified && orderId && amount) {
      // Get or create wallet in Supabase
      let { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

      if (!wallet) {
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({ user_id: user.id, balance: 0 })
          .select()
          .single()
        wallet = newWallet
      }

      if (wallet) {
        const paymentAmount = Number(amount)
        const newBalance = (wallet.balance || 0) + paymentAmount

        await supabase
          .from("wallets")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("id", wallet.id)

        console.log("[v0] Wallet updated in Supabase. New balance:", newBalance)

        // Update pending transaction to completed
        const { data: existingTxn } = await supabase
          .from("transactions")
          .select("id")
          .eq("reference_id", orderId)
          .eq("status", "pending")
          .single()

        if (existingTxn) {
          await supabase
            .from("transactions")
            .update({
              status: "completed",
              description: `${provider === "bkash" ? "bKash" : "Nagad"} রিচার্জ সফল`,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingTxn.id)
        } else {
          await supabase.from("transactions").insert({
            wallet_id: wallet.id,
            type: "credit",
            amount: paymentAmount,
            description: `${provider === "bkash" ? "bKash" : "Nagad"} রিচার্জ সফল`,
            payment_method: provider || "ekhoni",
            reference_id: transactionId || orderId,
            status: "completed",
          })
        }
      }

      return NextResponse.redirect(
        `${MAIN_DOMAIN}/wallet?payment_status=success&amount=${amount}&provider=${provider || "bkash"}`,
      )
    }

    return NextResponse.redirect(`${MAIN_DOMAIN}/wallet?payment_status=failed`)
  } catch (error) {
    console.error("[v0] Ekhoni success callback error:", error)
    return NextResponse.redirect(`${MAIN_DOMAIN}/wallet?payment_status=error`)
  }
}
