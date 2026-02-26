import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: pharmacies, error } = await supabase
      .from("pharmacies")
      .select("*")
      .eq("email", email.toLowerCase())
      .limit(1)

    if (error || !pharmacies || pharmacies.length === 0) {
      return NextResponse.json({ error: "Pharmacy not found" }, { status: 404 })
    }

    const pharmacy = pharmacies[0]

    return NextResponse.json({
      success: true,
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        email: pharmacy.email,
        phone: pharmacy.phone,
        address: pharmacy.address,
        license_number: pharmacy.license_number,
      }
    })
  } catch (error: any) {
    console.error("[v0] Pharmacy login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
