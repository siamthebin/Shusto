"use client"

import { useEffect, useState } from "react"
import { Clock, Calendar, Phone, FileText, ArrowLeft, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  symptoms: string
  status: string
  payment_status: string
  patient_name: string
  patient_email: string
  patient_phone: string
  doctor_name: string
  doctor_id: string
  doctor_fee: string
}

export default function AppointmentsWaitinglist() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAppointments()
    const interval = setInterval(loadAppointments, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/appointments/all-pending")

      if (!response.ok) {
        console.error("Failed to fetch appointments")
        setAppointments([])
        return
      }

      const data = await response.json()
      setAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/appointments/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      })

      if (response.ok) {
        loadAppointments()
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 shadow-lg">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.push("/doctor-portal/dashboard")}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>ফিরে যান</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">অ্যাপয়েন্টমেন্ট রিকোয়েস্ট</h1>
              <p className="text-emerald-100 text-lg">সকল রোগীদের নতুন অ্যাপয়েন্টমেন্ট অনুরোধ</p>
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
        <div className="max-w-4xl mx-auto">
          {appointments.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">কোনো অপেক্ষমাণ অ্যাপয়েন্টমেন্ট নেই</h2>
                <p className="text-gray-600 mb-6">যখন রোগীরা অ্যাপয়েন্টমেন্ট বুক করবেন, তখন এখানে দেখা যাবে</p>
                <button
                  onClick={() => router.push("/doctor-portal/dashboard")}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  ড্যাশবোর্ডে ফিরুন
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">অপেক্ষমাণ অ্যাপয়েন্টমেন্ট</h2>
                  <p className="text-gray-600">ডাক্তারের অনুমোদনের জন্য অপেক্ষা করছে</p>
                </div>
                <span className="ml-auto bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold text-lg">
                  {appointments.length}
                </span>
              </div>

              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4 border-amber-500"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-700 font-bold text-2xl">
                              {apt.patient_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{apt.patient_name}</h3>
                            <p className="text-gray-600 text-sm">{apt.patient_email}</p>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-bold rounded-full">
                          অপেক্ষমাণ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">তারিখ</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(apt.appointment_date).toLocaleDateString("bn-BD")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">সময়</p>
                            <p className="font-semibold text-gray-900">{apt.appointment_time.split(".")[0]}</p>
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2 mb-2">
                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-blue-700 font-semibold">রোগীর লক্ষণ</p>
                              <p className="text-sm text-blue-800 leading-relaxed">{apt.symptoms}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, "confirmed")}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <Check className="w-5 h-5" />
                          অনুমোদন করুন
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, "cancelled")}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold border border-gray-300 transition-all"
                        >
                          <X className="w-5 h-5" />
                          প্রত্যাখ্যান করুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
