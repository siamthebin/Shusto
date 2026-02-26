"use client"

import { useEffect, useState } from "react"
import { Clock, Calendar, Phone, FileText, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase-browser"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  symptoms: string
  status: string
  patient_name: string
  patient_email: string
  patient_phone: string
  doctor_name: string
  doctor_id: string
  doctor_fee: string
}

export default function DebugAllAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAllAppointments()
  }, [])

  const loadAllAppointments = async () => {
    try {
      setIsLoading(true)
      const supabase = createBrowserClient()

      // Fetch ALL appointments directly from database
      const { data, error } = await supabase.from("appointments").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching appointments:", error)
        return
      }

      setAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white pb-20">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16 shadow-lg">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-red-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>ফিরে যান</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">🐛 DEBUG: সব অ্যাপয়েন্টমেন্ট</h1>
              <p className="text-red-100 text-lg">ডাটাবেজের সমস্ত অ্যাপয়েন্টমেন্ট (ফিল্টার ছাড়া)</p>
            </div>
            {appointments.length > 0 && (
              <span className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-bold text-2xl">
                {appointments.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-sm text-yellow-800 font-semibold">
              ⚠️ এটি একটি ডিবাগ পেজ - এখানে ডাটাবেজের সমস্ত অ্যাপয়েন্টমেন্ট দেখাবে (কোনো ডাক্তার ফিল্টার নেই)
            </p>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">ডাটাবেজে কোনো অ্যাপয়েন্টমেন্ট নেই</h2>
                <p className="text-gray-600">ডাটাবেজ সম্পূর্ণ খালি - কোনো অ্যাপয়েন্টমেন্ট বুক হয়নি</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4 ${
                    apt.status === "pending"
                      ? "border-amber-500"
                      : apt.status === "confirmed"
                        ? "border-green-500"
                        : "border-red-500"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-bold text-2xl">
                            {apt.patient_name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{apt.patient_name || "নাম নেই"}</h3>
                          <p className="text-gray-600 text-sm">{apt.patient_email || "ইমেইল নেই"}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ডাক্তার: {apt.doctor_name || "নাম নেই"} (ID: {apt.doctor_id?.slice(0, 8) || "নেই"}...)
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 text-sm font-bold rounded-full ${
                          apt.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : apt.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apt.status === "pending" ? "অপেক্ষমাণ" : apt.status === "confirmed" ? "অনুমোদিত" : "বাতিল"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">তারিখ</p>
                          <p className="font-semibold text-gray-900">
                            {apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString("bn-BD") : "নেই"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">সময়</p>
                          <p className="font-semibold text-gray-900">{apt.appointment_time?.split(".")[0] || "নেই"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">ফোন</p>
                          <p className="font-semibold text-gray-900">{apt.patient_phone || "নেই"}</p>
                        </div>
                      </div>
                    </div>

                    {apt.symptoms && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-blue-700 font-semibold">রোগীর লক্ষণ</p>
                            <p className="text-sm text-blue-800 leading-relaxed">{apt.symptoms}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
