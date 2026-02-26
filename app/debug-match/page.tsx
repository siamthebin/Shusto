"use client"

import { useEffect, useState } from "react"

export default function DebugMatch() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/debug-match")
      .then((r) => r.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-8">Debug: Doctor-Appointment Matching</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">All Doctors</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {data.doctors?.map((d: any) => (
              <tr key={d.id} className="border-b">
                <td className="p-2">{d.id}</td>
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
        <p className="mb-4">Total: {data.appointments?.length || 0}</p>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Doctor ID</th>
              <th className="text-left p-2">Patient</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.appointments?.map((apt: any) => (
              <tr key={apt.id} className="border-b">
                <td className="p-2">{apt.id}</td>
                <td className="p-2 font-mono">{apt.doctor_id}</td>
                <td className="p-2">{apt.patient_name}</td>
                <td className="p-2">{apt.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
