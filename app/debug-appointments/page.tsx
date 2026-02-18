"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase-browser"

export default function DebugAppointmentsPage() {
  const [debug, setDebug] = useState<any>({
    userEmail: null,
    appointments: [],
    error: null,
    loading: true,
  })

  useEffect(() => {
    async function debugAppointments() {
      try {
        const supabase = createBrowserClient()

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.log("[v0 DEBUG] Current user:", user)

        if (!user?.email) {
          setDebug({ userEmail: null, appointments: [], error: "No user logged in", loading: false })
          return
        }

        // Fetch appointments from API
        const response = await fetch(`/api/appointments?patientEmail=${encodeURIComponent(user.email)}`)
        const data = await response.json()

        console.log("[v0 DEBUG] API Response:", data)

        setDebug({
          userEmail: user.email,
          appointments: data.appointments || [],
          error: data.error || null,
          loading: false,
        })
      } catch (error: any) {
        console.error("[v0 DEBUG] Error:", error)
        setDebug((prev) => ({ ...prev, error: error.message, loading: false }))
      }
    }

    debugAppointments()
  }, [])

  if (debug.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Loading Debug Info...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-teal-700">Appointments Debug Information</h1>

        <div className="space-y-6">
          {/* User Email */}
          <div className="border-2 border-teal-200 rounded-lg p-4 bg-teal-50">
            <h2 className="font-bold text-lg mb-2">Logged In User Email:</h2>
            <p className="text-xl font-mono bg-white px-4 py-2 rounded">{debug.userEmail || "NOT LOGGED IN"}</p>
          </div>

          {/* Error */}
          {debug.error && (
            <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
              <h2 className="font-bold text-lg mb-2 text-red-700">Error:</h2>
              <p className="text-red-600">{debug.error}</p>
            </div>
          )}

          {/* Appointments Count */}
          <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
            <h2 className="font-bold text-lg mb-2">Total Appointments Found:</h2>
            <p className="text-4xl font-bold text-emerald-700">{debug.appointments.length}</p>
          </div>

          {/* Appointments List */}
          {debug.appointments.length > 0 ? (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h2 className="font-bold text-lg mb-4">Appointments Details:</h2>
              <div className="space-y-4">
                {debug.appointments.map((apt: any, index: number) => (
                  <div key={apt.id} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>#{index + 1} ID:</strong> {apt.id}
                      </div>
                      <div>
                        <strong>Status:</strong> {apt.status}
                      </div>
                      <div>
                        <strong>Patient:</strong> {apt.patient_name}
                      </div>
                      <div>
                        <strong>Email:</strong> {apt.patient_email}
                      </div>
                      <div>
                        <strong>Doctor ID:</strong> {apt.doctor_id}
                      </div>
                      <div>
                        <strong>Date:</strong> {apt.appointment_date}
                      </div>
                      <div className="col-span-2">
                        <strong>Created:</strong> {new Date(apt.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <h2 className="font-bold text-lg mb-2 text-yellow-700">No Appointments Found</h2>
              <p className="text-yellow-600">
                No appointments found for user: <strong>{debug.userEmail}</strong>
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <h2 className="font-bold text-lg mb-2">Debug Steps:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Check if user email is showing correctly</li>
              <li>Check if appointments count matches what you expect</li>
              <li>Verify patient_email in appointments matches your logged-in email</li>
              <li>Take a screenshot and share with developer if issue persists</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
