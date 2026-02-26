"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import DoctorAppointments from "@/components/doctor-appointments"

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          patient_name,
          patient_email,
          patient_phone,
          appointment_date,
          symptoms,
          status,
          video_room_url,
          doctors (
            id,
            name,
            specialty
          )
        `)
        .order("appointment_date", { ascending: true })

      if (error) {
        console.error("Error fetching appointments:", error)
      } else {
        setAppointments(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">ডাক্তার ড্যাশবোর্ড</h1>
            <p className="text-gray-600">আপনার আজকের সকল appointments এবং consultations দেখুন</p>
          </div>

          <DoctorAppointments appointments={appointments} />
        </div>
      </div>
    </div>
  )
}
