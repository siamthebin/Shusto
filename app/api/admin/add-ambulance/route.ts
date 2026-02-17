import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, driver_name, vehicle_number, vehicle_type, service_area, address } = body

    console.log("[v0] Adding ambulance:", { name, email, phone })

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    // Insert new ambulance
    const result = await sql`
      INSERT INTO ambulances (name, email, phone, driver_name, vehicle_number, vehicle_type, service_area, address, is_active, is_available)
      VALUES (${name}, ${email}, ${phone}, ${driver_name || null}, ${vehicle_number || null}, ${vehicle_type || 'basic'}, ${service_area || null}, ${address || null}, true, true)
      RETURNING *
    `
    console.log("[v0] Ambulance added successfully:", result[0]?.id)

    // Create Supabase auth user for this ambulance email
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

    return NextResponse.json({ success: true, ambulance: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error adding ambulance:", error)
    return NextResponse.json({ error: error.message || "Failed to add ambulance" }, { status: 500 })
  }
}
