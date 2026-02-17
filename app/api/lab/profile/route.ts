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
      email = request.headers.get('x-lab-email')
    }
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)
    const labs = await sql`SELECT * FROM labs WHERE email = ${email} AND is_active = true`

    if (labs.length === 0) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 })
    }

    return NextResponse.json({ lab: labs[0] })
  } catch (error: any) {
    console.error("[v0] Lab profile error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
