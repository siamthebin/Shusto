import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.doctor_id) {
      return NextResponse.json(
        {
          error: "ডাক্তার আইডি প্রয়োজন",
          success: false,
        },
        { status: 400 },
      )
    }

    const connectionString =
      process.env.DATABASE_URL ||
      process.env.NEON_DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_POSTGRES_URL

    if (!connectionString) {
      throw new Error("Database connection string not found")
    }

    const sql = neon(connectionString)

    const doctor_id = String(body.doctor_id)
    const doctor_name = body.doctor_name || "Unknown Doctor"
    const patient_name = body.patient_name || "Guest Patient"
    const patient_email = body.patient_email || null
    const patient_phone = body.patient_phone || "01700000000"
    const appointment_date = body.appointment_date || new Date().toISOString().split("T")[0]
    const appointment_time = body.appointment_time || new Date().toTimeString().split(" ")[0]
    const symptoms = body.symptoms || "General Consultation Request"
    const video_room_id = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const result = await sql`
      INSERT INTO appointments (
        doctor_id,
        doctor_name,
        patient_name,
        patient_email,
        patient_phone,
        appointment_date,
        appointment_time,
        symptoms,
        status,
        payment_status,
        video_room_id
      )
      VALUES (
        ${doctor_id},
        ${doctor_name},
        ${patient_name},
        ${patient_email},
        ${patient_phone},
        ${appointment_date},
        ${appointment_time},
        ${symptoms},
        'pending',
        'unpaid',
        ${video_room_id}
      )
      RETURNING id
    `

    console.log("[v0] Direct SQL Insert Success:", result)

    return NextResponse.json({
      success: true,
      id: result[0].id,
      message: "অ্যাপয়েন্টমেন্ট সফলভাবে তৈরি হয়েছে!",
    })
  } catch (error: any) {
    console.error("Server Error:", error)
    return NextResponse.json(
      {
        error: "সার্ভার সমস্যা: " + (error.message || "Unknown"),
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patient_email = searchParams.get("patient_email")
    const video_room_id = searchParams.get("video_room_id")
    const doctor_id = searchParams.get("doctor_id")

    if (!patient_email && !video_room_id && !doctor_id) {
      return NextResponse.json({ error: "patient_email, video_room_id, বা doctor_id প্রয়োজন" }, { status: 400 })
    }

    const connectionString =
      process.env.DATABASE_URL ||
      process.env.NEON_DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_POSTGRES_URL

    if (!connectionString) {
      console.error("Database connection string not found")
      return NextResponse.json([], { status: 200 })
    }

    const sql = neon(connectionString)

    let appointments

    if (doctor_id) {
      appointments = await sql`
        SELECT * FROM appointments
        WHERE doctor_id = ${doctor_id}
        ORDER BY created_at DESC
      `
    } else if (video_room_id) {
      appointments = await sql`
        SELECT * FROM appointments
        WHERE video_room_id = ${video_room_id}
      `
    } else {
      appointments = await sql`
        SELECT * FROM appointments
        WHERE patient_email = ${patient_email}
        ORDER BY created_at DESC
      `
    }

    console.log(`[v0] Fetched ${appointments.length} appointments`)

    return NextResponse.json(appointments || [])
  } catch (error) {
    console.error("API GET Error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
