import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE appointments 
        ADD COLUMN IF NOT EXISTS doctor_email TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_appointments_doctor_email 
        ON appointments(doctor_email);
      `,
    })

    if (error) {
      console.error("Migration error:", error)
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({
      success: true,
      message: "doctor_email column added successfully",
    })
  } catch (error) {
    console.error("Migration failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
