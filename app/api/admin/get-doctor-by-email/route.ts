import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "ইমেইল প্রয়োজন" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: doctor, error } = await supabase
      .from("doctors")
      .select("id, name, specialty, email")
      .eq("email", email)
      .single()

    if (error || !doctor) {
      return NextResponse.json({ error: "ডাক্তার পাওয়া যায়নি" }, { status: 404 })
    }

    return NextResponse.json({ doctor })
  } catch (error) {
    console.error("Error fetching doctor:", error)
    return NextResponse.json({ error: "ডাক্তার খোঁজায় সমস্যা হয়েছে" }, { status: 500 })
  }
}
