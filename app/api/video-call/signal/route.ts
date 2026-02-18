import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.NEON_DATABASE_URL!)

// In-memory tracking of active participants (for instant detection)
const activeParticipants = new Map<string, Set<string>>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { appointmentId, type, data, role } = body

    console.log("[v0] Signal received:", { appointmentId, type, role, dataType: typeof data })

    if (!appointmentId || !type || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type === "join") {
      if (!activeParticipants.has(appointmentId)) {
        activeParticipants.set(appointmentId, new Set())
      }
      activeParticipants.get(appointmentId)!.add(role)
      console.log(
        "[v0] Active participants for",
        appointmentId,
        ":",
        Array.from(activeParticipants.get(appointmentId)!),
      )
    }

    switch (type) {
      case "join":
        // Still update database but don't rely on it
        if (role === "doctor") {
          await sql`UPDATE appointments SET doctor_joined = true WHERE id = ${appointmentId}`
        } else {
          await sql`UPDATE appointments SET patient_joined = true WHERE id = ${appointmentId}`
        }
        break

      case "offer":
        const offerData = typeof data === "string" ? data : JSON.stringify(data)
        await sql`
          UPDATE appointments 
          SET call_offer = ${offerData}, call_status = 'calling'
          WHERE id = ${appointmentId}
        `
        console.log("[v0] Offer saved:", offerData.substring(0, 50))
        break

      case "answer":
        const answerData = typeof data === "string" ? data : JSON.stringify(data)
        await sql`
          UPDATE appointments 
          SET call_answer = ${answerData}, 
              call_status = 'active',
              call_started_at = NOW()
          WHERE id = ${appointmentId}
        `
        console.log("[v0] Answer saved:", answerData.substring(0, 50))
        break

      case "ice-candidate":
        const candidateData = typeof data === "string" ? data : JSON.stringify(data)
        if (role === "doctor") {
          await sql`
            UPDATE appointments 
            SET ice_candidates_doctor = array_append(
              COALESCE(ice_candidates_doctor, ARRAY[]::TEXT[]), 
              ${candidateData}
            )
            WHERE id = ${appointmentId}
          `
        } else {
          await sql`
            UPDATE appointments 
            SET ice_candidates_patient = array_append(
              COALESCE(ice_candidates_patient, ARRAY[]::TEXT[]), 
              ${candidateData}
            )
            WHERE id = ${appointmentId}
          `
        }
        break

      case "end-call":
        if (activeParticipants.has(appointmentId)) {
          activeParticipants.get(appointmentId)!.delete(role)
          if (activeParticipants.get(appointmentId)!.size === 0) {
            activeParticipants.delete(appointmentId)
          }
        }
        await sql`
          UPDATE appointments 
          SET call_status = 'ended', call_ended_at = NOW()
          WHERE id = ${appointmentId}
        `
        break

      default:
        return NextResponse.json({ error: "Invalid signal type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Signal error:", error)
    return NextResponse.json({ error: "Failed to process signal" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointmentId")

    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 })
    }

    let result
    try {
      result = await sql`
        SELECT 
          call_status, call_offer, call_answer,
          ice_candidates_doctor, ice_candidates_patient,
          doctor_joined, patient_joined
        FROM appointments
        WHERE id = ${appointmentId}
      `
    } catch (dbError) {
      console.log("[v0] Database error (table may not exist yet):", dbError)
      result = []
    }

    const data = result.length > 0 ? result[0] : null

    const participants = activeParticipants.get(appointmentId) || new Set()
    const doctorJoined = participants.has("doctor")
    const patientJoined = participants.has("patient")

    console.log(
      "[v0] GET - Active participants:",
      Array.from(participants),
      "doctor:",
      doctorJoined,
      "patient:",
      patientJoined,
    )

    return NextResponse.json({
      call_status: data?.call_status || null,
      call_offer: data?.call_offer || null,
      call_answer: data?.call_answer || null,
      ice_candidates_doctor: data?.ice_candidates_doctor || [],
      ice_candidates_patient: data?.ice_candidates_patient || [],
      doctor_joined: doctorJoined,
      patient_joined: patientJoined,
      appointment_exists: data !== null,
    })
  } catch (error) {
    console.error("[v0] GET error:", error)
    return NextResponse.json({
      call_status: null,
      call_offer: null,
      call_answer: null,
      ice_candidates_doctor: [],
      ice_candidates_patient: [],
      doctor_joined: false,
      patient_joined: false,
      appointment_exists: false,
    })
  }
}
