import { type NextRequest, NextResponse } from "next/server"

const APP_KEY = process.env.BKASH_APP_KEY!
const APP_SECRET = process.env.BKASH_APP_SECRET!
const USERNAME = process.env.BKASH_USERNAME!
const PASSWORD = process.env.BKASH_PASSWORD!
const IS_SANDBOX = process.env.BKASH_SANDBOX === "true"

const BASE_URL = IS_SANDBOX
  ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
  : "https://tokenized.pay.bka.sh/v1.2.0-beta"

export async function POST(request: NextRequest) {
  try {
    const res = await fetch(`${BASE_URL}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: USERNAME,
        password: PASSWORD,
      },
      body: JSON.stringify({
        app_key: APP_KEY,
        app_secret: APP_SECRET,
      }),
    })

    const data = await res.json()

    if (data.statusCode !== "0000") {
      return NextResponse.json({ error: "Token generation failed", message: data.statusMessage }, { status: 400 })
    }

    return NextResponse.json({ id_token: data.id_token, expires_in: data.expires_in })
  } catch (error) {
    console.error("[v0] bKash token error:", error)
    return NextResponse.json({ error: "Token generation failed" }, { status: 500 })
  }
}
