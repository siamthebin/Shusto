"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase-browser"

export default function DoctorDebugPage() {
  const [data, setData] = useState<any>({
    loading: true,
    doctorEmail: null,
    doctorFromDB: null,
    allAppointments: [],
    matchingAppointments: [],
    error: null,
  })

  useEffect(() => {
    async function diagnose() {
      try {
        const supabase = createBrowserClient()

        // Get logged-in user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.email) {
          setData({
            loading: false,
            error: "No doctor logged in",
            doctorEmail: null,
            doctorFromDB: null,
            allAppointments: [],
            matchingAppointments: [],
          })
          return
        }

        // Get doctor info from database
        const { data: doctor, error: doctorError } = await supabase
          .from("doctors")
          .select("*")
          .eq("email", user.email)
          .single()

        console.log("[v0 DIAGNOSTIC] Doctor from DB:", doctor)
        console.log("[v0 DIAGNOSTIC] Doctor ID:", doctor?.id)

        // Get ALL appointments (no filter)
        const { data: allAppts, error: allError } = await supabase
          .from("appointments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20)

        console.log("[v0 DIAGNOSTIC] All appointments:", allAppts)

        // Get appointments matching this doctor's ID
        const { data: matchingAppts, error: matchError } = await supabase
          .from("appointments")
          .select("*")
          .eq("doctor_id", doctor?.id)
          .order("created_at", { ascending: false })

        console.log("[v0 DIAGNOSTIC] Matching appointments:", matchingAppts)

        setData({
          loading: false,
          doctorEmail: user.email,
          doctorFromDB: doctor,
          allAppointments: allAppts || [],
          matchingAppointments: matchingAppts || [],
          error: doctorError || allError || matchError || null,
        })
      } catch (error: any) {
        console.error("[v0 DIAGNOSTIC] Error:", error)
        setData((prev) => ({ ...prev, loading: false, error: error.message }))
      }
    }

    diagnose()
  }, [])

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold">Loading Diagnostic Data...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-2">🔍 Doctor Dashboard Diagnostic</h1>
          <p className="text-gray-600 mb-6">This page will show you EXACTLY why appointments are not appearing</p>

          {/* Doctor Info */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-blue-700">👨‍⚕️ Logged-In Doctor Info</h2>
            <div className="space-y-2">
              <div className="flex gap-4">
                <strong className="w-32">Email:</strong>
                <span className="font-mono bg-white px-3 py-1 rounded">{data.doctorEmail || "NOT LOGGED IN"}</span>
              </div>
              <div className="flex gap-4">
                <strong className="w-32">Doctor ID:</strong>
                <span className="font-mono text-2xl bg-yellow-200 px-3 py-1 rounded font-bold">
                  {data.doctorFromDB?.id || "NOT FOUND"}
                </span>
              </div>
              <div className="flex gap-4">
                <strong className="w-32">Doctor Name:</strong>
                <span className="font-mono bg-white px-3 py-1 rounded">{data.doctorFromDB?.name || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Matching Appointments */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">
              ✅ Appointments Matching Your Doctor ID ({data.doctorFromDB?.id})
            </h2>
            <div className="text-4xl font-bold mb-4 text-green-600">Count: {data.matchingAppointments.length}</div>
            {data.matchingAppointments.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-auto">
                {data.matchingAppointments.map((apt: any) => (
                  <div key={apt.id} className="bg-white p-3 rounded border border-green-200 text-sm">
                    <strong>ID {apt.id}:</strong> {apt.patient_name} | doctor_id: {apt.doctor_id} | Status: {apt.status}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-700 font-semibold">No appointments match your doctor_id!</p>
            )}
          </div>

          {/* All Recent Appointments */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-orange-700">📋 All Recent Appointments (Last 20)</h2>
            <div className="text-4xl font-bold mb-4 text-orange-600">Total Count: {data.allAppointments.length}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-orange-200">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Patient</th>
                    <th className="p-2 text-left">doctor_id</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {data.allAppointments.map((apt: any) => (
                    <tr
                      key={apt.id}
                      className={`border-b ${apt.doctor_id === data.doctorFromDB?.id ? "bg-green-100" : "bg-red-50"}`}
                    >
                      <td className="p-2">{apt.id}</td>
                      <td className="p-2">{apt.patient_name}</td>
                      <td className="p-2 font-bold text-lg">
                        {apt.doctor_id}
                        {apt.doctor_id === data.doctorFromDB?.id && " ✅"}
                        {apt.doctor_id !== data.doctorFromDB?.id && " ❌"}
                      </td>
                      <td className="p-2">{apt.status}</td>
                      <td className="p-2">{new Date(apt.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 text-purple-700">🧠 Analysis</h2>
            <div className="space-y-2 text-sm">
              <p>
                ✅ <strong>Your Doctor ID:</strong> {data.doctorFromDB?.id}
              </p>
              <p>
                ✅ <strong>Appointments with your ID:</strong> {data.matchingAppointments.length}
              </p>
              <p>
                ⚠️ <strong>Total appointments in database:</strong> {data.allAppointments.length}
              </p>
              <p className="text-red-600 font-bold mt-4">
                {data.matchingAppointments.length === 0 && data.allAppointments.length > 0
                  ? "🔴 PROBLEM: Appointments exist but none have your doctor_id! Check the doctor_id column values above."
                  : data.matchingAppointments.length > 0
                    ? "🟢 GOOD: Some appointments match your doctor_id. Dashboard should work after refresh!"
                    : "🟡 No appointments exist yet. Book one to test."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
