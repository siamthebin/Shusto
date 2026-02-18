import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.email !== "shustobd@gmail.com") {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("id")

    console.log("[v0] Deleting doctor with ID:", doctorId)

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID প্রয়োজন" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const result = await sql`
      DELETE FROM doctors WHERE id = ${doctorId}
      RETURNING *
    `

    console.log("[v0] Delete result:", result)

    if (result.length === 0) {
      return NextResponse.json({ error: "ডাক্তার পাওয়া যায়নি" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "ডাক্তার সফলভাবে মুছে ফেলা হয়েছে",
    })
  } catch (error: any) {
    console.error("[v0] Error deleting doctor:", error)
    return NextResponse.json({ error: error.message || "অজানা ত্রুটি ঘটেছে" }, { status: 500 })
  }
}
