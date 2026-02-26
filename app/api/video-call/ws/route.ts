import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  return neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!)
}

// Get or create room
async function getRoom(roomId: string) {
  const sql = getSQL()
  // Try to get existing room
  const existing = await sql`
    SELECT * FROM video_call_rooms WHERE id = ${roomId}
  `

  if (existing.length > 0) {
    return existing[0]
  }

  // Create new room
  await sql`
    INSERT INTO video_call_rooms (id, doctor_joined, patient_joined, offer, answer, doctor_candidates, patient_candidates)
    VALUES (${roomId}, false, false, null, null, '[]'::jsonb, '[]'::jsonb)
    ON CONFLICT (id) DO NOTHING
  `

  const newRoom = await sql`SELECT * FROM video_call_rooms WHERE id = ${roomId}`
  return newRoom[0]
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL()
    const body = await request.json()
    const { type, roomId, role, data } = body

    console.log("[API] POST:", type, "Room:", roomId, "Role:", role)

    switch (type) {
      case "join":
        if (role === "doctor") {
          await sql`
            INSERT INTO video_call_rooms (id, doctor_joined, patient_joined, doctor_candidates, patient_candidates)
            VALUES (${roomId}, true, false, '[]'::jsonb, '[]'::jsonb)
            ON CONFLICT (id) DO UPDATE SET doctor_joined = true, updated_at = NOW()
          `
          console.log("[API] Doctor joined:", roomId)
        } else {
          await sql`
            INSERT INTO video_call_rooms (id, doctor_joined, patient_joined, doctor_candidates, patient_candidates)
            VALUES (${roomId}, false, true, '[]'::jsonb, '[]'::jsonb)
            ON CONFLICT (id) DO UPDATE SET patient_joined = true, updated_at = NOW()
          `
          console.log("[API] Patient joined:", roomId)
        }
        break

      case "offer":
        await sql`
          UPDATE video_call_rooms 
          SET offer = ${JSON.stringify(data)}::jsonb, updated_at = NOW()
          WHERE id = ${roomId}
        `
        console.log("[API] Offer saved")
        break

      case "answer":
        await sql`
          UPDATE video_call_rooms 
          SET answer = ${JSON.stringify(data)}::jsonb, updated_at = NOW()
          WHERE id = ${roomId}
        `
        console.log("[API] Answer saved")
        break

      case "ice-candidate":
        if (role === "doctor") {
          await sql`
            UPDATE video_call_rooms 
            SET doctor_candidates = doctor_candidates || ${JSON.stringify([data])}::jsonb, updated_at = NOW()
            WHERE id = ${roomId}
          `
        } else {
          await sql`
            UPDATE video_call_rooms 
            SET patient_candidates = patient_candidates || ${JSON.stringify([data])}::jsonb, updated_at = NOW()
            WHERE id = ${roomId}
          `
        }
        break

      case "reset":
        await sql`
          DELETE FROM video_call_rooms WHERE id = ${roomId}
        `
        console.log("[API] Room reset:", roomId)
        break
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[API] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const sql = getSQL()
    const roomId = request.nextUrl.searchParams.get("roomId")
    const role = request.nextUrl.searchParams.get("role")

    if (!roomId) {
      return NextResponse.json({ error: "roomId required" }, { status: 400 })
    }

    const rooms = await sql`SELECT * FROM video_call_rooms WHERE id = ${roomId}`

    if (rooms.length === 0) {
      return NextResponse.json({
        patientConnected: false,
        doctorConnected: false,
        offer: null,
        answer: null,
        doctorCandidates: [],
        patientCandidates: [],
      })
    }

    const room = rooms[0]

    if (role === "doctor") {
      return NextResponse.json({
        patientConnected: room.patient_joined,
        answer: room.answer,
        patientCandidates: room.patient_candidates || [],
      })
    } else {
      return NextResponse.json({
        doctorConnected: room.doctor_joined,
        offer: room.offer,
        doctorCandidates: room.doctor_candidates || [],
      })
    }
  } catch (err) {
    console.error("[API] GET Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getSQL()
    const roomId = request.nextUrl.searchParams.get("roomId")
    if (roomId) {
      await sql`DELETE FROM video_call_rooms WHERE id = ${roomId}`
      console.log("[API] Room deleted:", roomId)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
