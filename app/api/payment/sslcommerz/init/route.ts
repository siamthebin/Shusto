import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// SSLCommerz Sandbox credentials
const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || "shust6992a1e590b0e"
const SSLCOMMERZ_STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || "6e7a0efbf62b1d6e27e29dd77d73"
const SSLCOMMERZ_SANDBOX_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
const SSLCOMMERZ_SANDBOX_CHECKOUT = "https://sandbox.sslcommerz.com/EasyCheckOut/testcde5c2957680c3ba6a68ebfbdfea223af80"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a patient (not provider)
    const userEmail = user.email?.toLowerCase() || ""
    if (userEmail === "shustobd@gmail.com") {
      return NextResponse.json({ error: "Provider accounts cannot add money" }, { status: 403 })
    }

    const body = await request.json()
    const { amount, provider } = body

    if (!amount || amount < 10) {
      return NextResponse.json({ error: "Minimum amount is 10 BDT" }, { status: 400 })
    }

    const tranId = `SHUSTO_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`

    // Get user name from profile
    const { data: profile } = await supabase.from("user_profiles").select("full_name").eq("id", user.id).single()
    const customerName = profile?.full_name || user.email?.split("@")[0] || "Customer"

    // Store pending transaction
    let { data: wallet } = await supabase.from("wallets").select("id").eq("user_id", user.id).single()

    if (!wallet) {
      const { data: newWallet } = await supabase
        .from("wallets")
        .insert({ user_id: user.id, balance: 0 })
        .select()
        .single()
      wallet = newWallet
    }

    if (wallet) {
      await supabase.from("transactions").insert({
        wallet_id: wallet.id,
        type: "credit",
        amount: Number(amount),
        description: `SSLCommerz অর্থপ্রেরণ (অপেক্ষমাণ)`,
        payment_method: "sslcommerz",
        reference_id: tranId,
        status: "pending",
      })
    }

    // Build SSLCommerz form parameters for POST
    const postParams = {
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: SSLCOMMERZ_STORE_PASSWORD,
      total_amount: amount,
      currency: "BDT",
      tran_id: tranId,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payment/sslcommerz/success`,
      fail_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payment/sslcommerz/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payment/sslcommerz/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payment/sslcommerz/ipn`,
      
      // Customer info
      cus_name: customerName,
      cus_email: user.email || "customer@shusto.com",
      cus_phone: user.phone || "01700000000",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      
      // Product info
      product_name: "Online Medical Services Payment",
      product_category: "medical_services",
      product_profile: "general",
      
      // Value A for custom data
      value_a: user.id,
      
      // Sandbox mode
      is_sandbox: true,
    }

    console.log("[v0] SSLCommerz init - Store ID:", SSLCOMMERZ_STORE_ID)
    console.log("[v0] SSLCommerz init - Transaction ID:", tranId)

    // Return the parameters for client to POST to SSLCommerz
    return NextResponse.json({
      success: true,
      post_params: postParams,
      sslcommerz_url: SSLCOMMERZ_SANDBOX_URL,
      order_id: tranId,
      message: "Payment initialized - Ready to redirect to SSLCommerz",
    })
  } catch (error: any) {
    console.error("[v0] SSLCommerz init error:", error)
    return NextResponse.json(
      {
        error: "Payment initialization failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
