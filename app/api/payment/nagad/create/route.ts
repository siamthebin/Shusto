import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const MERCHANT_ID = process.env.NAGAD_MERCHANT_ID!
const MERCHANT_NUMBER = process.env.NAGAD_MERCHANT_NUMBER!
const PUBLIC_KEY = process.env.NAGAD_PUBLIC_KEY!
const PRIVATE_KEY = process.env.NAGAD_PRIVATE_KEY!
const IS_SANDBOX = process.env.NAGAD_SANDBOX === "true"

const BASE_URL = IS_SANDBOX
  ? "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs"
  : "https://api.mynagad.com/api/dfs"

function generateSignature(data: string): string {
  const sign = crypto.createSign("SHA256")
  sign.update(data)
  sign.end()
  return sign.sign(PRIVATE_KEY, "base64")
}

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json()

    if (!amount || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const timestamp = Date.now().toString()
    const callbackURL = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/nagad/callback`

    // Initialize payment
    const initData = {
      merchantId: MERCHANT_ID,
      dateTime: timestamp,
      orderId,
      challenge: crypto.randomBytes(20).toString("hex"),
    }

    const sensitiveData = {
      merchantId: MERCHANT_ID,
      datetime: timestamp,
      orderId,
      challenge: initData.challenge,
    }

    const signature = generateSignature(JSON.stringify(sensitiveData))

    const initRes = await fetch(`${BASE_URL}/check-out/initialize/${MERCHANT_ID}/${orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KM-Api-Version": "v-0.2.0",
        "X-KM-IP-V4": request.ip || "127.0.0.1",
        "X-KM-Client-Type": "PC_WEB",
      },
      body: JSON.stringify({
        ...initData,
        signature,
      }),
    })

    const initResult = await initRes.json()

    if (!initResult.sensitiveData || !initResult.signature) {
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 400 })
    }

    // Complete payment request
    const completeData = {
      merchantId: MERCHANT_ID,
      orderId,
      amount,
      currencyCode: "050",
      challenge: initData.challenge,
      productDetails: JSON.stringify([{ productName: "Wallet Recharge", amount }]),
    }

    const completeSignature = generateSignature(JSON.stringify(completeData))

    const completeRes = await fetch(`${BASE_URL}/check-out/complete/${initResult.paymentReferenceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KM-Api-Version": "v-0.2.0",
        "X-KM-IP-V4": request.ip || "127.0.0.1",
        "X-KM-Client-Type": "PC_WEB",
      },
      body: JSON.stringify({
        ...completeData,
        merchantCallbackURL: callbackURL,
        signature: completeSignature,
      }),
    })

    const completeResult = await completeRes.json()

    if (!completeResult.callBackUrl) {
      return NextResponse.json({ error: "Payment URL generation failed" }, { status: 400 })
    }

    return NextResponse.json({
      paymentUrl: completeResult.callBackUrl,
      orderId,
      amount,
    })
  } catch (error) {
    console.error("[v0] Nagad create payment error:", error)
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 })
  }
}
