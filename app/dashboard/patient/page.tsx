"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { WebRTCVideoCall } from "@/components/webrtc-video-call"
import { Video } from 'lucide-react'

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  symptoms: string
  status: string
  payment_status: string
  doctor_name: string
  doctor_specialty: string
  consultation_fee: number
  video_room_id: string
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patientEmail, setPatientEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeVideoCall, setActiveVideoCall] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const userEmail = localStorage.getItem("patientEmail") || localStorage.getItem("userEmail")

    if (!userEmail) {
      router.push("/")
      return
    }

    setPatientEmail(userEmail)
    loadAppointments(userEmail)
  }

  const loadAppointments = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/appointments?patient_email=${email}`)
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

  const handleLogout = () => {
    localStorage.removeItem("userEmail")
    localStorage.removeItem("patientEmail")
    router.push("/")
  }

  const canJoinVideoCall = (appointmentDate: string, appointmentTime: string) => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
    const now = new Date()
    const fifteenMinutesBefore = new Date(appointmentDateTime.getTime() - 15 * 60000)
    return now >= fifteenMinutesBefore && now <= new Date(appointmentDateTime.getTime() + 60 * 60000)
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

  const getPaymentBadge = (status: string) => {
    return status === "paid" ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">পরিশোধিত</span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">অপরিশোধিত</span>
    )
  }

  if (activeVideoCall) {
    return (
      <WebRTCVideoCall
        appointmentId={activeVideoCall}
        role="patient"
        onCallEnd={() => {
          setActiveVideoCall(null)
          if (patientEmail) loadAppointments(patientEmail)
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
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">রোগী ড্যাশবোর্ড</h1>
            <p className="text-sm text-gray-600">স্বাগতম, {patientEmail}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">হোম</Button>
            </Link>
            <Link href="/doctors">
              <Button className="bg-emerald-600 hover:bg-emerald-700">নতুন অ্যাপয়েন্টমেন্ট</Button>
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
              <CardDescription>আসন্ন</CardDescription>
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
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>বাতিল</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {appointments.filter((a) => a.status === "cancelled").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>আমার অ্যাপয়েন্টমেন্ট</CardTitle>
            <CardDescription>আপনার সকল অ্যাপয়েন্টমেন্ট দেখুন</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">আপনার কোনো অ্যাপয়েন্টমেন্ট নেই</p>
                <Link href="/doctors">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">ডাক্তার খুঁজুন</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">ডা. {appointment.doctor_name}</h3>
                          {getStatusBadge(appointment.status)}
                          {getPaymentBadge(appointment.payment_status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">বিশেষত্ব:</span> {appointment.doctor_specialty}
                          </div>
                          <div>
                            <span className="font-medium">ফি:</span> ৳{appointment.consultation_fee}
                          </div>
                          <div>
                            <span className="font-medium">তারিখ:</span>{" "}
                            {new Date(appointment.appointment_date).toLocaleDateString("bn-BD")}
                          </div>
                          <div>
                            <span className="font-medium">সময়:</span> {appointment.appointment_time}
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
                        {appointment.payment_status === "unpaid" && appointment.status !== "cancelled" && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            পেমেন্ট করুন
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
