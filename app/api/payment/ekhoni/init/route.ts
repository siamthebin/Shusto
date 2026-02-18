import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const EKHONI_API_KEY = "WXO5tXMnKlBRpW5F9rG6PpB9XCYsa3MjWrYzSAroaYhQWhgCcA"

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

    const orderId = `SHUSTO_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`

    // Get user name from profile
    const { data: profile } = await supabase.from("user_profiles").select("full_name").eq("id", user.id).single()
    const customerName = profile?.full_name || user.email?.split("@")[0] || "Customer"

    // Store pending transaction first
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
        description: `${provider === "bkash" ? "bKash" : "Nagad"} রিচার্জ (অপেক্ষমাণ)`,
        payment_method: provider,
        reference_id: orderId,
        status: "pending",
      })
    }

    const formData = new FormData()
    formData.append("cus_name", customerName)
    formData.append("cus_email", user.email || "customer@shusto.com")
    formData.append("cus_phone", "01700000000")
    formData.append("amount", amount.toString())
    formData.append("tran_id", orderId)
    formData.append("currency", "BDT")
    formData.append("desc", "Shusto Wallet Recharge")
    formData.append(
      "success_url",
      `https://shusto.com/wallet?payment_status=success&orderId=${orderId}&amount=${amount}&userId=${user.id}`,
    )
    formData.append("fail_url", `https://shusto.com/wallet?payment_status=failed`)
    formData.append("cancel_url", `https://shusto.com/wallet?payment_status=cancelled`)
    formData.append("type", provider === "bkash" ? "bkash" : "nagad")

    // Try FormData POST request
    try {
      const response = await fetch("https://source.ekhonidigital.com/api/create-payment", {
        method: "POST",
        headers: {
          "API-KEY": EKHONI_API_KEY,
        },
        body: formData,
      })

      const responseText = await response.text()
      console.log("[v0] Ekhoni FormData response:", responseText)

      try {
        const data = JSON.parse(responseText)
        const paymentUrl =
          data.payment_url || data.url || data.redirect_url || data.GatewayPageURL || data.data?.payment_url

        if (paymentUrl) {
          return NextResponse.json({
            success: true,
            payment_url: paymentUrl,
            order_id: orderId,
          })
        }
      } catch {
        // Response might be a redirect URL directly
        if (responseText.startsWith("http")) {
          return NextResponse.json({
            success: true,
            payment_url: responseText.trim(),
            order_id: orderId,
          })
        }
      }
    } catch (e) {
      console.log("[v0] FormData request failed:", e)
    }

    try {
      const urlEncodedData = new URLSearchParams({
        cus_name: customerName,
        cus_email: user.email || "customer@shusto.com",
        cus_phone: "01700000000",
        amount: amount.toString(),
        tran_id: orderId,
        currency: "BDT",
        desc: "Shusto Wallet Recharge",
        success_url: `https://shusto.com/wallet?payment_status=success&orderId=${orderId}&amount=${amount}&userId=${user.id}`,
        fail_url: `https://shusto.com/wallet?payment_status=failed`,
        cancel_url: `https://shusto.com/wallet?payment_status=cancelled`,
        type: provider === "bkash" ? "bkash" : "nagad",
      })

      const response = await fetch("https://source.ekhonidigital.com/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "API-KEY": EKHONI_API_KEY,
        },
        body: urlEncodedData.toString(),
      })

      const responseText = await response.text()
      console.log("[v0] Ekhoni URLEncoded response:", responseText)

      try {
        const data = JSON.parse(responseText)
        const paymentUrl =
          data.payment_url || data.url || data.redirect_url || data.GatewayPageURL || data.data?.payment_url

        if (paymentUrl) {
          return NextResponse.json({
            success: true,
            payment_url: paymentUrl,
            order_id: orderId,
          })
        }
      } catch {
        if (responseText.startsWith("http")) {
          return NextResponse.json({
            success: true,
            payment_url: responseText.trim(),
            order_id: orderId,
          })
        }
      }
    } catch (e) {
      console.log("[v0] URLEncoded request failed:", e)
    }

    try {
      const jsonPayload = {
        cus_name: customerName,
        cus_email: user.email || "customer@shusto.com",
        cus_phone: "01700000000",
        amount: Number(amount),
        tran_id: orderId,
        currency: "BDT",
        desc: "Shusto Wallet Recharge",
        success_url: `https://shusto.com/wallet?payment_status=success&orderId=${orderId}&amount=${amount}&userId=${user.id}`,
        fail_url: `https://shusto.com/wallet?payment_status=failed`,
        cancel_url: `https://shusto.com/wallet?payment_status=cancelled`,
        type: provider === "bkash" ? "bkash" : "nagad",
      }

      const response = await fetch("https://source.ekhonidigital.com/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-KEY": EKHONI_API_KEY,
          Accept: "application/json",
        },
        body: JSON.stringify(jsonPayload),
      })

      const responseText = await response.text()
      console.log("[v0] Ekhoni JSON response:", responseText)

      try {
        const data = JSON.parse(responseText)
        const paymentUrl =
          data.payment_url || data.url || data.redirect_url || data.GatewayPageURL || data.data?.payment_url

        if (paymentUrl) {
          return NextResponse.json({
            success: true,
            payment_url: paymentUrl,
            order_id: orderId,
          })
        }

        // Return exact error from Ekhoni
        return NextResponse.json(
          {
            error: data.message || "Invalid API request",
            details: JSON.stringify(data),
          },
          { status: 400 },
        )
      } catch {
        return NextResponse.json(
          {
            error: "Unexpected response from payment gateway",
            details: responseText,
          },
          { status: 400 },
        )
      }
    } catch (e: any) {
      return NextResponse.json(
        {
          error: "Payment gateway connection failed",
          details: e.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Payment init error:", error)
    return NextResponse.json(
      {
        error: "Payment initialization failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
