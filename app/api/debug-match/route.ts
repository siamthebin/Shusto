import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data: doctors } = await supabase.from("doctors").select("id, name, email").order("id")

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false })

  return NextResponse.json({ doctors, appointments })
}
