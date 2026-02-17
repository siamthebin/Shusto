import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, method, userId } = await request.json()

    if (!amount || !method || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get wallet
    const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single()

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Create transaction
    const { data: transaction, error: txnError } = await supabase
      .from("transactions")
      .insert({
        wallet_id: wallet.id,
        amount: Number.parseFloat(amount),
        type: "credit",
        status: "completed",
        description: `${method === "bkash" ? "bKash" : "Nagad"} রিচার্জ`,
        payment_method: method,
      })
      .select()
      .single()

    if (txnError) throw txnError

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance + Number.parseFloat(amount) })
      .eq("id", wallet.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("[v0] Demo payment error:", error)
    return NextResponse.json({ error: "Payment failed" }, { status: 500 })
  }
}
