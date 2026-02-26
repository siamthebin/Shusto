export interface SignalData {
  type: "offer" | "answer" | "ice-candidate"
  data: RTCSessionDescriptionInit | RTCIceCandidateInit
  appointmentId: number
  userId: string
}

export async function sendSignal(signal: SignalData) {
  try {
    const response = await fetch("/api/video-call/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signal),
    })

    if (!response.ok) {
      throw new Error("Failed to send signal")
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Signaling error:", error)
    throw error
  }
}

export async function pollSignals(appointmentId: number, userId: string) {
  try {
    const response = await fetch(`/api/video-call/signal?appointmentId=${appointmentId}&userId=${userId}`)

    if (!response.ok) {
      return []
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Poll signals error:", error)
    return []
  }
}
