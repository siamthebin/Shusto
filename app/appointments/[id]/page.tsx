"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from 'next/navigation'
import AppointmentDetails from "@/components/appointment-details"
import BalanceHeader from "@/components/kokonutui/balance-header"

export default function AppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAppointment()
  }, [])

  async function loadAppointment() {
    try {
      const id = params.id as string
      
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          doctors (*)
        `)
        .eq("id", id)
        .single()

      if (error || !data) {
        router.push("/dashboard")
        return
      }

      if (!data.video_room_url) {
        const response = await fetch("/api/video-call/create-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId: id }),
        })
        
        if (response.ok) {
          const { videoUrl } = await response.json()
          data.video_room_url = videoUrl
        }
      }

      setAppointment(data)
    } catch (error) {
      console.error("Error loading appointment:", error)
      router.push("/dashboard")
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

  if (!appointment) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <BalanceHeader />
      <main className="container mx-auto px-4 py-8">
        <AppointmentDetails appointment={appointment} />
      </main>
    </div>
  )
}
