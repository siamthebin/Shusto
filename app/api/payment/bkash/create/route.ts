import { type NextRequest, NextResponse } from "next/server"

const APP_KEY = process.env.BKASH_APP_KEY!
const IS_SANDBOX = process.env.BKASH_SANDBOX === "true"

const BASE_URL = IS_SANDBOX
  ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
  : "https://tokenized.pay.bka.sh/v1.2.0-beta"

export async function POST(request: NextRequest) {
  try {
    const { amount, invoiceNumber, id_token } = await request.json()

    if (!amount || !invoiceNumber || !id_token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const callbackURL = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/bkash/callback`

    const res = await fetch(`${BASE_URL}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: `Bearer ${id_token}`,
        "x-app-key": APP_KEY,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: "CUSTOMER",
        callbackURL,
        amount: amount.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invoiceNumber,
      }),
    })

    const data = await res.json()

    if (data.statusCode !== "0000") {
      return NextResponse.json({ error: "Payment creation failed", message: data.statusMessage }, { status: 400 })
    }

    return NextResponse.json({
      paymentID: data.paymentID,
      bkashURL: data.bkashURL,
      callbackURL: data.callbackURL,
      successCallbackURL: data.successCallbackURL,
      failureCallbackURL: data.failureCallbackURL,
      cancelledCallbackURL: data.cancelledCallbackURL,
    })
  } catch (error) {
    console.error("[v0] bKash create payment error:", error)
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 })
  }
}
