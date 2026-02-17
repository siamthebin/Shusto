import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, license_number, owner_name, latitude, longitude } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    // Check if pharmacy already exists
    const existing = await sql`SELECT id FROM pharmacies WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "A pharmacy with this email already exists" }, { status: 400 })
    }

    // Insert new pharmacy
    const result = await sql`
      INSERT INTO pharmacies (name, email, phone, address, license_number, owner_name, latitude, longitude, is_active)
      VALUES (${name}, ${email}, ${phone || null}, ${address || null}, ${license_number || null}, ${owner_name || null}, ${latitude || null}, ${longitude || null}, true)
      RETURNING *
    `

    console.log("[v0] Pharmacy added successfully:", result[0]?.id)
    
    // Create Supabase auth user for this pharmacy email
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => 
                cookieStore.set(name, value, options)
              )
            },
          },
        }
      )

      // Create user in Supabase auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: Math.random().toString(36).slice(-12),
        email_confirm: true,
      })

      if (authError) {
        console.log("[v0] Supabase user creation note:", authError.message)
      } else {
        console.log("[v0] Supabase auth user created:", authUser?.id)
      }
    } catch (authErr) {
      console.log("[v0] Supabase auth setup note:", authErr)
    }

    return NextResponse.json({ pharmacy: result[0], success: true })
  } catch (error: any) {
    console.error("[v0] Error adding pharmacy:", error)
    return NextResponse.json({ error: error.message || "Failed to add pharmacy" }, { status: 500 })
  }
}
