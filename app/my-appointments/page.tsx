"use client"

import { useEffect, useState, useRef } from "react"
import { Clock, CheckCircle, ArrowLeft, Calendar, DollarSign, User, Video } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import IncomingCallModal from "@/components/incoming-call-modal"

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [showIncomingCall, setShowIncomingCall] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const ringtoneRef = useRef<HTMLAudioElement | null>(null)

  const router = useRouter()

  useEffect(() => {
    ringtoneRef.current = new Audio("/ringtone.mp3")
    ringtoneRef.current.loop = true

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause()
        ringtoneRef.current.currentTime = 0
      }
    }
  }, [])

  useEffect(() => {
    loadAppointments()
    startPollingForIncomingCalls()

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const startPollingForIncomingCalls = async () => {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) return

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/appointments?patient_email=${encodeURIComponent(user.email)}`)
        if (response.ok) {
          const allAppointments = await response.json()

          console.log("[v0] Polling for incoming calls, appointments:", allAppointments.length)

          // Check for incoming calls (confirmed appointments with call signals)
          for (const apt of allAppointments) {
            if (apt.status === "confirmed" && apt.video_room_id) {
              // Check if doctor initiated a call
              const signalResponse = await fetch(`/api/video-call/signal?appointmentId=${apt.id}`)
              if (signalResponse.ok) {
                const signalData = await signalResponse.json()

                console.log("[v0] Signal data for appointment", apt.id, ":", signalData)

                // If doctor has created an offer, show incoming call
                if (signalData.call_offer && !showIncomingCall) {
                  console.log("[v0] Incoming call detected! Showing modal")
                  setIncomingCall(apt)
                  setShowIncomingCall(true)

                  // Play ringtone
                  if (ringtoneRef.current) {
                    ringtoneRef.current.play().catch(() => {})
                  }
                  break
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("[v0] Error polling for incoming calls:", error)
      }
    }, 2000) // Poll every 2 seconds for instant detection
  }

  const loadAppointments = async () => {
    setLoading(true)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email) {
        const response = await fetch(`/api/appointments?patient_email=${encodeURIComponent(user.email)}`)
        if (response.ok) {
          const apiAppointments = await response.json()
          setAppointments(apiAppointments)
        }
      }
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptCall = () => {
    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }

    setShowIncomingCall(false)

    if (incomingCall?.video_room_id) {
      router.push(`/video-call?room=${incomingCall.video_room_id}`)
    }
  }

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending")
  const confirmedAppointments = appointments.filter((apt) => apt.status === "confirmed")

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white pb-20">
      {showIncomingCall && incomingCall && (
        <IncomingCallModal
          doctorName={incomingCall.doctor_name}
          specialty={incomingCall.doctor_specialty}
          onAccept={handleAcceptCall}
          onReject={() => {}} // Empty function since reject button is removed
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 shadow-lg">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>ফিরে যান</span>
          </button>
          <div>
            <h1 className="text-4xl font-bold mb-3">আমার অ্যাপয়েন্টমেন্ট</h1>
            <p className="text-emerald-100 text-lg">আপনার সব অ্যাপয়েন্টমেন্ট এক জায়গায়</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">লোড হচ্ছে...</p>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">কোনো অ্যাপয়েন্টমেন্ট নেই</h2>
              <p className="text-gray-600 mb-6">আপনি এখনো কোনো অ্যাপয়েন্টমেন্ট বুক করেননি</p>
              <button
                onClick={() => router.push("/doctors")}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                ডাক্তার খুঁজুন
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Pending Appointments */}
            {pendingAppointments.length > 0 && (
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
                    {pendingAppointments.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {pendingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4 border-amber-500"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{apt.doctor_name}</h3>
                              <p className="text-emerald-600 font-medium">{apt.doctor_specialty}</p>
                            </div>
                          </div>
                          <span className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-bold rounded-full">
                            অপেক্ষমাণ
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
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
                              <p className="font-semibold text-gray-900">{apt.appointment_time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">পরামর্শ ফি</p>
                              <p className="font-semibold text-gray-900">৳{apt.doctor_fee}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-yellow-800 font-medium">
                            ডাক্তার আপনার অ্যাপয়েন্টমেন্ট গ্রহণ করলে ভিডিও কল শুরু হবে
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed Appointments */}
            {confirmedAppointments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">নিশ্চিত অ্যাপয়েন্টমেন্ট</h2>
                    <p className="text-gray-600">ডাক্তার কর্তৃক অনুমোদিত</p>
                  </div>
                  <span className="ml-auto bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-lg">
                    {confirmedAppointments.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {confirmedAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4 border-emerald-500"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{apt.doctor_name}</h3>
                              <p className="text-emerald-600 font-medium">{apt.doctor_specialty}</p>
                            </div>
                          </div>
                          <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-bold rounded-full">
                            নিশ্চিত
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
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
                              <p className="font-semibold text-gray-900">{apt.appointment_time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">পরামর্শ ফি</p>
                              <p className="font-semibold text-gray-900">৳{apt.doctor_fee}</p>
                            </div>
                          </div>
                        </div>

                        {apt.meeting_time && (
                          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-emerald-700 font-semibold">ডাক্তার নির্ধারিত মিটিং সময়</p>
                                <p className="font-bold text-lg text-emerald-900">
                                  {new Date(apt.meeting_time).toLocaleString("bn-BD", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => router.push(`/video-call?room=${apt.video_room_id}`)}
                          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                          <Video className="w-6 h-6" />
                          ভিডিও কলে কথা বলুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
