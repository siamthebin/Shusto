import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const APP_KEY = process.env.BKASH_APP_KEY!
const IS_SANDBOX = process.env.BKASH_SANDBOX === "true"

const BASE_URL = IS_SANDBOX
  ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
  : "https://tokenized.pay.bka.sh/v1.2.0-beta"

export async function POST(request: NextRequest) {
  try {
    const { paymentID, id_token, walletId, amount } = await request.json()

    if (!paymentID || !id_token || !walletId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const res = await fetch(`${BASE_URL}/tokenized/checkout/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: `Bearer ${id_token}`,
        "x-app-key": APP_KEY,
      },
      body: JSON.stringify({ paymentID }),
    })

    const data = await res.json()

    if (data.statusCode !== "0000") {
      return NextResponse.json({ error: "Payment execution failed", message: data.statusMessage }, { status: 400 })
    }

    // Payment successful, update wallet
    const supabase = await createClient()

    // Get current wallet balance
    const { data: wallet } = await supabase.from("wallets").select("balance").eq("id", walletId).single()

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Update wallet balance
    await supabase
      .from("wallets")
      .update({ balance: wallet.balance + Number.parseFloat(amount) })
      .eq("id", walletId)

    // Create transaction record
    await supabase.from("transactions").insert({
      wallet_id: walletId,
      type: "credit",
      amount: Number.parseFloat(amount),
      description: "ওয়ালেট রিচার্জ - bKash",
      payment_method: "bkash",
      transaction_id: data.trxID,
      status: "completed",
    })

    return NextResponse.json({
      success: true,
      trxID: data.trxID,
      transactionStatus: data.transactionStatus,
      amount: data.amount,
      customerMsisdn: data.customerMsisdn,
    })
  } catch (error) {
    console.error("[v0] bKash execute payment error:", error)
    return NextResponse.json({ error: "Payment execution failed" }, { status: 500 })
  }
}
