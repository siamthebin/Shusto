import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, license_number, owner_name, services } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    // Insert new lab
    const result = await sql`
      INSERT INTO labs (name, email, phone, address, license_number, owner_name, services, is_active)
      VALUES (${name}, ${email}, ${phone || null}, ${address || null}, ${license_number || null}, ${owner_name || null}, ${services || null}, true)
      RETURNING *
    `

    console.log("[v0] Lab added successfully:", result[0]?.id)
    
    // Create Supabase auth user for this lab email
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

    return NextResponse.json({ success: true, lab: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error adding lab:", error)
    return NextResponse.json({ error: error.message || "Failed to add lab" }, { status: 500 })
  }
}
