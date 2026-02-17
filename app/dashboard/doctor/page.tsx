"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { WebRTCVideoCall } from "@/components/webrtc-video-call"
import { Video } from "lucide-react"

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
  video_room_id: string
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [doctorEmail, setDoctorEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeVideoCall, setActiveVideoCall] = useState<string | null>(null)
  const [incomingCall, setIncomingCall] = useState<Appointment | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!doctorId) return

    const interval = setInterval(() => {
      loadAppointments(doctorId)
      checkForIncomingCalls(doctorId)
    }, 5000)

    return () => clearInterval(interval)
  }, [doctorId])

  const checkAuth = async () => {
    const userEmail = localStorage.getItem("userEmail")

    if (!userEmail) {
      router.push("/")
      return
    }

    setDoctorEmail(userEmail)

    const defaultDoctorId = "1"
    setDoctorId(defaultDoctorId)
    loadAppointments(defaultDoctorId)
  }

  const loadAppointments = async (doctorId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/appointments?doctor_id=${doctorId}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error("[v0] Error loading appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok && doctorId) {
        loadAppointments(doctorId)
      }
    } catch (error) {
      console.error("[v0] Error updating appointment:", error)
    }
  }

  const acceptAppointmentWithTime = async (appointmentId: string, meetingTime: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "confirmed",
          meeting_time: meetingTime,
        }),
      })

      if (response.ok && doctorId) {
        loadAppointments(doctorId)
        setActiveVideoCall(appointmentId)
      }
    } catch (error) {
      console.error("[v0] Error accepting appointment:", error)
    }
  }

  const checkForIncomingCalls = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/appointments?doctor_id=${doctorId}`)
      if (response.ok) {
        const data = await response.json()
        const newPendingCall = data.find(
          (apt: Appointment) =>
            apt.status === "pending" && apt.payment_status === "paid" && !appointments.find((a) => a.id === apt.id),
        )

        if (newPendingCall) {
          setIncomingCall(newPendingCall)
          // Play notification sound
          if (typeof Audio !== "undefined") {
            const audio = new Audio("/notification.mp3")
            audio.play().catch(() => {})
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error checking incoming calls:", error)
    }
  }

  const acceptIncomingCall = async () => {
    if (!incomingCall) return

    await updateAppointmentStatus(incomingCall.id, "confirmed")
    setActiveVideoCall(incomingCall.id)
    setIncomingCall(null)
  }

  const rejectIncomingCall = async () => {
    if (!incomingCall) return

    await updateAppointmentStatus(incomingCall.id, "cancelled")
    setIncomingCall(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const canJoinVideoCall = (appointmentDate: string, appointmentTime: string) => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
    const now = new Date()
    const fifteenMinutesBefore = new Date(appointmentDateTime.getTime() - 15 * 60000)
    return now >= fifteenMinutesBefore && now <= new Date(appointmentDateTime.getTime() + 60 * 60000)
  }

  if (activeVideoCall) {
    return (
      <WebRTCVideoCall
        appointmentId={activeVideoCall}
        role="doctor"
        onCallEnd={() => {
          setActiveVideoCall(null)
          if (doctorId) loadAppointments(doctorId)
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-bounce">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">নতুন ভিডিও কল আসছে!</h2>
              <p className="text-gray-600 mb-1">রোগীর নাম: {incomingCall.patient_name}</p>
              <p className="text-gray-600 mb-1">ফোন: {incomingCall.patient_phone}</p>
              {incomingCall.symptoms && <p className="text-gray-600 mb-4">লক্ষণ: {incomingCall.symptoms}</p>}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={rejectIncomingCall}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 border-red-300 bg-transparent"
                >
                  প্রত্যাখ্যান করুন
                </Button>
                <Button onClick={acceptIncomingCall} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  কল গ্রহণ করুন
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">ডাক্তার ড্যাশবোর্ড</h1>
            <p className="text-sm text-gray-600">স্বাগতম, {doctorEmail}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">হোম</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
              লগআউট
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>মোট অ্যাপয়েন্টমেন্ট</CardDescription>
              <CardTitle className="text-3xl text-emerald-600">{appointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>অপেক্ষমাণ</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {appointments.filter((a) => a.status === "pending").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>নিশ্চিত</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {appointments.filter((a) => a.status === "confirmed").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>সম্পন্ন</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {appointments.filter((a) => a.status === "completed").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-8 border-yellow-200 bg-yellow-50" id="waitinglist">
          <CardHeader>
            <CardTitle className="text-yellow-800">অ্যাপয়েন্টমেন্ট ওয়েটিং লিস্ট</CardTitle>
            <CardDescription>নতুন অ্যাপয়েন্টমেন্ট রিকোয়েস্ট যা অনুমোদনের অপেক্ষায় রয়েছে</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.filter((a) => a.status === "pending").length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">বর্তমানে কোনো অপেক্ষমাণ অ্যাপয়েন্টমেন্ট নেই</p>
                <p className="text-sm mt-2">যখন রোগীরা অ্যাপয়েন্টমেন্ট বুক করবেন, তখন এখানে দেখা যাবে</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter((a) => a.status === "pending")
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white border border-yellow-300 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-700 font-bold text-lg">
                                {appointment.patient_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{appointment.patient_name}</h3>
                              <p className="text-sm text-gray-600">{appointment.patient_email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-md">
                            <div>
                              <span className="font-medium text-gray-700">📅 তারিখ:</span>{" "}
                              <span className="text-gray-900">
                                {new Date(appointment.appointment_date).toLocaleDateString("bn-BD")}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">🕐 সময়:</span>{" "}
                              <span className="text-gray-900">{appointment.appointment_time}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">📱 ফোন:</span>{" "}
                              <span className="text-gray-900">{appointment.patient_phone}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">💳 পেমেন্ট:</span>{" "}
                              <span
                                className={appointment.payment_status === "paid" ? "text-green-600" : "text-red-600"}
                              >
                                {appointment.payment_status === "paid" ? "পরিশোধিত ✓" : "অপরিশোধিত"}
                              </span>
                            </div>
                          </div>
                          {appointment.symptoms && (
                            <div className="mt-3 bg-blue-50 p-3 rounded-md">
                              <span className="font-medium text-blue-900">রোগীর লক্ষণ:</span>
                              <p className="text-blue-800 mt-1">{appointment.symptoms}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => {
                              acceptAppointmentWithTime(appointment.id, new Date().toISOString())
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                          >
                            ✓ অনুমোদন করুন
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                            className="text-red-600 hover:text-red-700 border-red-300 min-w-[140px]"
                          >
                            ✗ প্রত্যাখ্যান করুন
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>আসন্ন অ্যাপয়েন্টমেন্ট</CardTitle>
            <CardDescription>আপনার সকল অ্যাপয়েন্টমেন্ট দেখুন এবং ম্যানেজ করুন</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>কোনো অ্যাপয়েন্টমেন্ট নেই</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{appointment.patient_name}</h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">তারিখ:</span>{" "}
                            {new Date(appointment.appointment_date).toLocaleDateString("bn-BD")}
                          </div>
                          <div>
                            <span className="font-medium">সময়:</span> {appointment.appointment_time}
                          </div>
                          <div>
                            <span className="font-medium">ফোন:</span> {appointment.patient_phone}
                          </div>
                          <div>
                            <span className="font-medium">পেমেন্ট:</span>{" "}
                            {appointment.payment_status === "paid" ? "পরিশোধিত" : "অপরিশোধিত"}
                          </div>
                        </div>
                        {appointment.symptoms && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">লক্ষণ:</span>
                            <p className="text-gray-600 mt-1">{appointment.symptoms}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {appointment.status === "confirmed" &&
                          appointment.payment_status === "paid" &&
                          canJoinVideoCall(appointment.appointment_date, appointment.appointment_time) && (
                            <Button
                              size="sm"
                              onClick={() => setActiveVideoCall(appointment.id)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              ভিডিও কল
                            </Button>
                          )}
                        {appointment.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              acceptAppointmentWithTime(appointment.id, new Date().toISOString())
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            অনুমোদন ও শুরু করুন
                          </Button>
                        )}
                        {appointment.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            সম্পন্ন করুন
                          </Button>
                        )}
                        {(appointment.status === "pending" || appointment.status === "confirmed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                            className="text-red-600 hover:text-red-700"
                          >
                            বাতিল করুন
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const getStatusBadge = (status: string) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }
  const labels = {
    pending: "অপেক্ষমাণ",
    confirmed: "নিশ্চিত",
    completed: "সম্পন্ন",
    cancelled: "বাতিল",
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
}
