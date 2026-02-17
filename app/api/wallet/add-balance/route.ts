import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { amount, provider, transactionId, orderId } = await req.json()

    if (!amount || Number.parseFloat(amount) < 10) {
      return NextResponse.json({ error: "Invalid amount. Minimum is 10 BDT" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = user.email?.toLowerCase() || ""

    // Check if admin
    if (userEmail === "shustobd@gmail.com") {
      return NextResponse.json({ error: "Admin accounts cannot add balance" }, { status: 403 })
    }

    // Check if pharmacy
    const { data: pharmacyCheck } = await supabase.from("pharmacies").select("id").eq("email", user.email).single()

    if (pharmacyCheck) {
      return NextResponse.json({ error: "Pharmacy accounts cannot add balance" }, { status: 403 })
    }

    // Check if lab
    const { data: labCheck } = await supabase.from("labs").select("id").eq("email", user.email).single()

    if (labCheck) {
      return NextResponse.json({ error: "Lab accounts cannot add balance" }, { status: 403 })
    }

    // Check user_profiles for role
    const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

    if (profile?.role && !["patient", "user"].includes(profile.role)) {
      return NextResponse.json({ error: `${profile.role} accounts cannot add balance` }, { status: 403 })
    }

    // Get or create wallet
    let { data: walletData } = await supabase.from("wallets").select("id, balance").eq("user_id", user.id).single()

    if (!walletData) {
      // Create wallet if not exists
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({ user_id: user.id, balance: 0 })
        .select()
        .single()

      if (createError) {
        console.error("Failed to create wallet:", createError)
        return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 })
      }
      walletData = newWallet
    }

    const currentBalance = walletData.balance || 0
    const addAmount = Number.parseFloat(amount)
    const newBalance = currentBalance + addAmount

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", walletData.id)

    if (updateError) {
      console.error("Failed to update balance:", updateError)
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      wallet_id: walletData.id,
      amount: addAmount,
      type: "credit",
      description: `${provider === "bkash" ? "bKash" : "Nagad"} রিচার্জ`,
      payment_method: provider,
      transaction_id: transactionId,
      reference_id: orderId,
      status: "completed",
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      newBalance,
      message: "Balance added successfully",
    })
  } catch (error) {
    console.error("Add balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
