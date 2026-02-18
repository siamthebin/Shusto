"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestAppointmentPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createTestAppointment = async () => {
    setLoading(true)
    try {
      const appointmentData = {
        patient_name: "Test Patient",
        patient_phone: "01700000000",
        doctor_name: "Blue Doctor",
        date: "2025-01-25",
        time: "10:00 AM",
        status: "pending",
      }

      console.log("[v0] Creating test appointment for Blue Doctor:", appointmentData)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })

      const data = await response.json()
      console.log("[v0] POST API Response:", data)

      setResult({ success: response.ok, data, status: response.status })
    } catch (error) {
      console.error("[v0] Error:", error)
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const checkAppointments = async () => {
    setLoading(true)
    try {
      console.log("[v0] Fetching appointments for Blue Doctor")

      const response = await fetch("/api/appointments/doctor?doctor_name=Blue Doctor")
      const data = await response.json()

      console.log("[v0] GET API Response:", data)

      setResult({
        success: response.ok,
        data,
        status: response.status,
        count: Array.isArray(data) ? data.length : 0,
      })
    } catch (error) {
      console.error("[v0] Error:", error)
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-4">Blue Doctor Test Page</h1>
          <p className="text-gray-600 mb-6">
            এই page থেকে Blue Doctor এর জন্য test appointment create করুন এবং check করুন database এ save হচ্ছে কিনা।
          </p>

          <div className="space-y-4">
            <Button
              onClick={createTestAppointment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            >
              {loading ? "Creating..." : "১. Create Test Appointment for Blue Doctor"}
            </Button>

            <Button
              onClick={checkAppointments}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
            >
              {loading ? "Checking..." : "২. Check Blue Doctor's Appointments"}
            </Button>
          </div>

          {result && (
            <div
              className={`mt-6 p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <h3 className="font-bold mb-2 text-lg">
                {result.success ? "✅ Success!" : "❌ Error"}
                {result.count !== undefined && ` - Found ${result.count} appointments`}
              </h3>
              <pre className="text-sm overflow-auto max-h-96 bg-gray-100 p-4 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
