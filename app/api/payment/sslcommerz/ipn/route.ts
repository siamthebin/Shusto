import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// IPN (Instant Payment Notification) handler for SSLCommerz
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const status = formData.get("status")?.toString()
    const tranId = formData.get("tran_id")?.toString()
    const valId = formData.get("val_id")?.toString()
    const amount = formData.get("amount")?.toString()
    const userId = formData.get("value_a")?.toString()
    const cardType = formData.get("card_type")?.toString()

    console.log("[v0] SSLCommerz IPN:", { status, tranId, valId, amount, userId })

    if ((status === "VALID" || status === "VALIDATED") && userId && amount) {
      const supabase = await createClient()

      // Check if already processed
      const { data: existingTxn } = await supabase
        .from("transactions")
        .select("status")
        .eq("reference_id", tranId)
        .single()

      if (existingTxn?.status === "completed") {
        return NextResponse.json({ message: "Already processed" })
      }

      // Update wallet balance
      const { data: wallet } = await supabase.from("wallets").select("id, balance").eq("user_id", userId).single()

      if (wallet) {
        await supabase
          .from("wallets")
          .update({ balance: wallet.balance + Number(amount) })
          .eq("id", wallet.id)

        await supabase
          .from("transactions")
          .update({
            status: "completed",
            description: `${cardType || "bKash/Nagad"} রিচার্জ সফল`,
          })
          .eq("reference_id", tranId)

        console.log("[v0] IPN: Wallet updated for user:", userId)
      }
    }

    return NextResponse.json({ message: "IPN processed" })
  } catch (error: any) {
    console.error("[v0] SSLCommerz IPN error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
