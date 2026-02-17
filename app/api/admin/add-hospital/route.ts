import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, emergency_number, specialties, bed_count } = body

    console.log("[v0] Adding hospital:", { name, email, phone, address })

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    // Insert new hospital - handle specialties array properly
    const specialtiesArray = Array.isArray(specialties) ? specialties : null

    const result = await sql`
      INSERT INTO hospitals (name, email, phone, address, emergency_number, specialties, bed_count, is_active)
      VALUES (${name}, ${email}, ${phone || null}, ${address || null}, ${emergency_number || null}, ${specialtiesArray}, ${bed_count || 0}, true)
      RETURNING *
    `

    console.log("[v0] Hospital added successfully:", result[0]?.id)
    
    // Create Supabase auth user for this hospital email
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
        password: Math.random().toString(36).slice(-12), // Random password
        email_confirm: true, // Auto-confirm email
      })

      if (authError) {
        console.log("[v0] Supabase user creation note:", authError.message)
        // This is OK - user might already exist
      } else {
        console.log("[v0] Supabase auth user created:", authUser?.id)
      }
    } catch (authErr) {
      console.log("[v0] Supabase auth setup note:", authErr)
      // Continue anyway - not critical
    }

    return NextResponse.json({ success: true, hospital: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error adding hospital:", error)
    return NextResponse.json({ error: error.message || "Failed to add hospital" }, { status: 500 })
  }
}
