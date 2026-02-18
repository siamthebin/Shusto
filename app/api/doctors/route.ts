import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)

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
    const isAdmin = user?.email === "shustobd@gmail.com"

    let doctors = []
    try {
      doctors = await sql`
        SELECT * FROM doctors 
        ORDER BY created_at DESC
      `
    } catch (error) {
      console.error("[v0] Error fetching doctors:", error)
      doctors = []
    }

    return NextResponse.json({ doctors, isAdmin })
  } catch (error) {
    console.error("[v0] Error in doctors API:", error)
    return NextResponse.json({ doctors: [], isAdmin: false }, { status: 500 })
  }
}
