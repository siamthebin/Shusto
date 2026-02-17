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

    // Try to get email from Supabase auth first
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      email = user.email
      console.log("[v0] Using Supabase auth email:", email)
    }

    // If no Supabase user, try to get from request header (from frontend localStorage)
    if (!email) {
      const headerEmail = request.headers.get('x-hospital-email')
      if (headerEmail) {
        email = headerEmail
        console.log("[v0] Using header email:", email)
      }
    }

    if (!email) {
      return NextResponse.json({ error: "Unauthorized - No email found" }, { status: 401 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    // Fetch hospital by email
    const hospitals = await sql`
      SELECT * FROM hospitals WHERE email = ${email} AND is_active = true
    `

    if (hospitals.length === 0) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }

    return NextResponse.json({ hospital: hospitals[0] })
  } catch (error: any) {
    console.error("[v0] Error fetching hospital profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
