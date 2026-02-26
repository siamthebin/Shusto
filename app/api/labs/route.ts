import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  // Try Supabase first
  if (supabase) {
    try {
      if (email) {
        const { data, error } = await supabase.from("labs").select("*").eq("email", email).single()
        if (!error && data) {
          return NextResponse.json({ lab: data })
        }
      } else {
        const { data, error } = await supabase.from("labs").select("*").order("created_at", { ascending: false })
        if (!error && data) {
          return NextResponse.json({ labs: data })
        }
      }
    } catch (err) {
      console.log("[v0] Supabase labs fetch failed")
    }
  }

  // Return empty for client-side localStorage handling
  if (email) {
    return NextResponse.json({ lab: null })
  }
  return NextResponse.json({ labs: [] })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, phone, address, license_number, owner_name, services } = body

  const labData = {
    id: `lab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    email,
    phone,
    address,
    license_number,
    owner_name,
    services,
    is_active: true,
    created_at: new Date().toISOString()
  }

  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("labs")
        .insert([{ name, email, phone, address, license_number, owner_name, services }])
        .select()
        .single()

      if (!error && data) {
        return NextResponse.json({ lab: data, success: true })
      }
    } catch (err) {
      console.log("[v0] Supabase insert failed")
    }
  }

  // Return success for localStorage fallback
  return NextResponse.json({ 
    lab: labData, 
    success: true,
    useLocalStorage: true 
  })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  // Try Supabase first
  if (supabase) {
    try {
      const { error } = await supabase.from("labs").delete().eq("id", id)
      if (!error) {
        return NextResponse.json({ success: true })
      }
    } catch (err) {
      console.log("[v0] Supabase delete failed")
    }
  }

  return NextResponse.json({ success: true, useLocalStorage: true })
}
