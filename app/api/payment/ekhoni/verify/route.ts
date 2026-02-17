import { type NextRequest, NextResponse } from "next/server"

const EKHONI_VERIFY_URL = "https://source.ekhonidigital.com/api/payment/verify"
const EKHONI_API_KEY =
  process.env.EKHONI_API_KEY || process.env.EKHONI_BRAND_KEY || "WXO5tXMnKlBRpW5F9rG6PpB9XCYsa3MjWrYzSAroaYhQWhgCcA"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transaction_id } = body

    if (!transaction_id) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    const response = await fetch(EKHONI_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": EKHONI_API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({ transaction_id }),
    })

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Ekhoni verify error:", error)
    return NextResponse.json(
      {
        error: "Verification failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
