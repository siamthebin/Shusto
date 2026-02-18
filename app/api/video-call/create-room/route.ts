import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID required" }, { status: 400 })
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const videoUrl = `/video-call?room=${roomId}&role=patient&appointmentId=${appointmentId}`

    const supabase = await createClient()
    const { error } = await supabase.from("appointments").update({ video_room_url: videoUrl }).eq("id", appointmentId)

    if (error) {
      console.error("[v0] Error updating appointment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ videoUrl, roomId })
  } catch (error: any) {
    console.error("[v0] Error creating video room:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
