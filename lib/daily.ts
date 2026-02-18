"use server"

// Daily.co API integration for video calls
export async function createVideoRoom(appointmentId: string) {
  const DAILY_API_KEY = process.env.DAILY_API_KEY

  if (!DAILY_API_KEY) {
    // If no API key, return a demo room URL
    return `https://shusto.daily.co/${appointmentId}`
  }

  try {
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: appointmentId,
        privacy: "private",
        properties: {
          max_participants: 2,
          enable_screenshare: false,
          enable_chat: true,
          enable_knocking: true,
          enable_prejoin_ui: true,
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        },
      }),
    })

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error creating video room:", error)
    return `https://shusto.daily.co/${appointmentId}`
  }
}
