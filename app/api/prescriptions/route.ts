import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)
    const { searchParams } = new URL(request.url)
    const patientEmail = searchParams.get("patient_email")
    const doctorId = searchParams.get("doctor_id")

    console.log("[v0] GET prescriptions - patientEmail:", patientEmail, "doctorId:", doctorId)

    if (patientEmail) {
      const prescriptions = await sql`
        SELECT 
          p.*,
          'ডাক্তার' as doctor_name,
          'বিশেষজ্ঞ' as doctor_specialization
        FROM prescriptions p
        WHERE p.patient_email = ${patientEmail}
        ORDER BY p.created_at DESC
      `
      console.log("[v0] Found prescriptions for", patientEmail, ":", prescriptions.length)
      return NextResponse.json({ prescriptions })
    }

    if (doctorId) {
      console.log("[v0] Fetching prescriptions for doctorId:", doctorId)

      const prescriptions = await sql`
        SELECT * FROM prescriptions
        WHERE doctor_id::text = ${doctorId} OR doctor_id = ${Number(doctorId) || 0}
        ORDER BY created_at DESC
      `

      console.log("[v0] Found prescriptions for doctor:", prescriptions.length)
      return NextResponse.json({ prescriptions })
    }

    console.log("[v0] No params provided, returning all prescriptions")
    const allPrescriptions = await sql`
      SELECT * FROM prescriptions
      ORDER BY created_at DESC
      LIMIT 50
    `
    console.log("[v0] Total prescriptions in DB:", allPrescriptions.length)
    return NextResponse.json({ prescriptions: allPrescriptions, debug: "all" })
  } catch (error) {
    console.error("[v0] Error fetching prescriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch prescriptions", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)
    const body = await request.json()
    const {
      appointment_id,
      doctor_id,
      patient_email,
      patient_name,
      diagnosis,
      medicines,
      instructions,
      follow_up_date,
    } = body

    if (!doctor_id || !patient_email || !patient_name) {
      console.log("[v0] Missing fields:", { doctor_id, patient_email, patient_name })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Creating prescription for:", patient_email)

    try {
      await sql`SELECT 1 FROM prescriptions LIMIT 1`
    } catch (tableError) {
      console.error("[v0] Table does not exist:", tableError)
      return NextResponse.json(
        {
          error: "Database table 'prescriptions' does not exist",
          details: "Please visit /api/setup-prescriptions-table to create the table first",
          success: false,
        },
        { status: 500 },
      )
    }

    const result = await sql`
      INSERT INTO prescriptions (
        appointment_id,
        doctor_id,
        patient_email,
        patient_name,
        diagnosis,
        medicines,
        instructions,
        follow_up_date
      ) VALUES (
        ${appointment_id || null},
        ${doctor_id},
        ${patient_email},
        ${patient_name},
        ${diagnosis || ""},
        ${JSON.stringify(medicines || [])},
        ${instructions || ""},
        ${follow_up_date || null}
      )
      RETURNING *
    `

    if (!result || result.length === 0) {
      throw new Error("Insert failed - no data returned")
    }

    console.log("[v0] Prescription created successfully:", result[0])

    return NextResponse.json({ prescription: result[0], success: true })
  } catch (error) {
    console.error("[v0] Error creating prescription:", error)
    return NextResponse.json(
      {
        error: "Failed to create prescription",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
