import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET() {
  try {
    // Create prescriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER,
        doctor_id INTEGER NOT NULL,
        patient_email VARCHAR(255) NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        diagnosis TEXT,
        medicines JSONB,
        instructions TEXT,
        follow_up_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON prescriptions(appointment_id)`

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'prescriptions'
    `

    return NextResponse.json({
      success: true,
      message: "Prescriptions table created successfully",
      tableExists: tables.length > 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating prescriptions table:", error)
    return NextResponse.json({ error: "Failed to create table", details: error }, { status: 500 })
  }
}
