import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tranId = formData.get("tran_id")?.toString()
    const error = formData.get("error")?.toString()
    const amount = formData.get("amount")?.toString()

    console.log("[v0] SSLCommerz fail callback:", { tranId, error })

    // Update transaction status to failed
    if (tranId) {
      const supabase = await createClient()
      await supabase.from("transactions").update({ status: "failed" }).eq("reference_id", tranId)
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${baseUrl}/payment/success?status=failed&reason=${encodeURIComponent(error || "Payment failed")}&amount=${amount}&tran_id=${tranId}`,
      { status: 303 },
    )
  } catch (error: any) {
    console.error("[v0] SSLCommerz fail error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/payment/success?status=failed&reason=error`, { status: 303 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get("error")
  const amount = searchParams.get("amount")
  const tranId = searchParams.get("tran_id")

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return NextResponse.redirect(
    `${baseUrl}/payment/success?status=failed&reason=${encodeURIComponent(error || "Payment failed")}&amount=${amount}&tran_id=${tranId}`,
    { status: 303 },
  )
}
