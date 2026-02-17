import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tranId = formData.get("tran_id")?.toString()
    const amount = formData.get("amount")?.toString()

    console.log("[v0] SSLCommerz cancel callback:", { tranId })

    // Update transaction status to cancelled
    if (tranId) {
      const supabase = await createClient()
      await supabase.from("transactions").update({ status: "cancelled" }).eq("reference_id", tranId)
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${baseUrl}/payment/success?status=failed&reason=cancelled&amount=${amount}&tran_id=${tranId}`,
      { status: 303 },
    )
  } catch (error: any) {
    console.error("[v0] SSLCommerz cancel error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/payment/success?status=failed&reason=cancelled`, { status: 303 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const amount = searchParams.get("amount")
  const tranId = searchParams.get("tran_id")

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return NextResponse.redirect(
    `${baseUrl}/payment/success?status=failed&reason=cancelled&amount=${amount}&tran_id=${tranId}`,
    { status: 303 },
  )
}
