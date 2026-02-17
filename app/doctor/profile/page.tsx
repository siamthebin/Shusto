"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import DoctorProfileView from "@/components/doctor-profile-view"

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDoctorProfile()
  }, [])

  async function loadDoctorProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase
        .from("doctors")
        .select("*")
        .limit(1)
        .single()

      if (!data) {
        router.push("/doctor/register")
        return
      }

      setDoctor(data)
    } catch (error) {
      console.error("Error loading doctor profile:", error)
      router.push("/auth/login")
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

  if (!doctor) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <DoctorProfileView doctor={doctor} />
      </div>
    </div>
  )
}
