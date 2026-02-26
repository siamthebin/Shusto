"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DebugBookingPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isBooking, setIsBooking] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBooking = async () => {
    setIsBooking(true)
    setLogs([])

    addLog("🚀 শুরু করছি appointment booking test...")

    const userEmail = "shustobd@gmail.com"
    addLog(`📧 User email: ${userEmail}`)

    const bookingData = {
      doctor_id: 1,
      patient_name: "টেস্ট রোগী",
      patient_email: userEmail,
      patient_phone: "01712345678",
      appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      appointment_time: "14:00:00",
      symptoms: "টেস্ট সমস্যা",
    }

    addLog("📤 Booking data তৈরি করা হয়েছে")
    addLog(`📋 Data: ${JSON.stringify(bookingData, null, 2)}`)

    try {
      addLog("⏳ API call করছি...")

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      addLog(`📡 Response status: ${response.status}`)

      const data = await response.json()
      addLog(`📦 Response data: ${JSON.stringify(data, null, 2)}`)

      if (response.ok && data.success) {
        addLog("✅ SUCCESS! Appointment created!")
        addLog(`🆔 Appointment ID: ${data.id}`)

        // Verify in database
        addLog("🔍 Database verify করছি...")
        const verifyResponse = await fetch(`/api/appointments?patient_email=${encodeURIComponent(userEmail)}`)
        const verifyData = await verifyResponse.json()

        addLog(`📊 Database এ total appointments: ${verifyData.length || 0}`)

        if (verifyData.length > 0) {
          addLog("✅ DATABASE VERIFY SUCCESS! Appointment পাওয়া গেছে!")
          addLog(`📄 Latest appointment: ${JSON.stringify(verifyData[0], null, 2)}`)
        } else {
          addLog("❌ DATABASE VERIFY FAILED! Appointment database এ নেই!")
        }
      } else {
        addLog(`❌ BOOKING FAILED!`)
        addLog(`❌ Error: ${data.error || "Unknown error"}`)
        if (data.technicalError) {
          addLog(`🔧 Technical Error: ${data.technicalError}`)
        }
      }
    } catch (error) {
      addLog(`❌ CATCH ERROR: ${error instanceof Error ? error.message : String(error)}`)
    }

    setIsBooking(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">🔧 Appointment Booking Debug</h1>

          <Button onClick={testBooking} disabled={isBooking} className="w-full" size="lg">
            {isBooking ? "Testing..." : "Test Appointment Booking"}
          </Button>
        </Card>

        {logs.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">Debug Logs:</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto bg-black text-green-400 p-4 rounded font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
