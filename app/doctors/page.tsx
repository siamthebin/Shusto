"use client"

import { useEffect, useState } from "react"
import DoctorCard from "@/components/doctor-card"
import { useRouter } from 'next/navigation'
import { ClipboardList, X, Clock, CheckCircle } from 'lucide-react'
import { createBrowserClient } from "@/lib/supabase-browser"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/doctors')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.doctors || [])
        setIsAdmin(data.isAdmin || false)
      }
    } catch (error) {
      console.error("[v0] Error loading doctors:", error)
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-emerald-900 mb-4">ডাক্তার পাওয়া যায়নি</h1>
          <p className="text-gray-600">এখনো কোনো ডাক্তার যোগ করা হয়নি।</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="bg-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">আমাদের ডাক্তারগণ</h1>
              <p className="text-emerald-100">অভিজ্ঞ ও দক্ষ চিকিৎসকদের সাথে অনলাইনে পরামর্শ নিন</p>
            </div>
            <button
              onClick={() => router.push('/my-appointments')}
              className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <ClipboardList className="w-8 h-8" />
              <span className="text-sm font-medium">আমার অ্যাপয়েন্টমেন্ট</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} isAdmin={isAdmin} />
          ))}
        </div>
      </div>
    </div>
  )
}
