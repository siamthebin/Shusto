import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
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

    let email = null
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      email = user.email
    }
    if (!email) {
      email = request.headers.get('x-ambulance-email')
    }
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)
    const ambulances = await sql`SELECT * FROM ambulances WHERE email = ${email} AND is_active = true`

    if (ambulances.length === 0) {
      return NextResponse.json({ error: "Ambulance not found" }, { status: 404 })
    }

    return NextResponse.json({ ambulance: ambulances[0] })
  } catch (error: any) {
    console.error("[v0] Ambulance profile error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
