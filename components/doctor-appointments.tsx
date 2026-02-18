"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Calendar, Clock, User, Phone, Mail, FileText } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  appointment_date: string
  symptoms: string
  status: string
  video_room_url: string
  doctors: {
    id: string
    name: string
    specialty: string
  }
}

export default function DoctorAppointments({ appointments }: { appointments: Appointment[] }) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const router = useRouter()

  const handleJoinVideoCall = (appointment: Appointment) => {
    if (appointment.video_room_url) {
      const url = new URL(appointment.video_room_url, window.location.origin)
      url.searchParams.set("role", "doctor")
      router.push(url.pathname + url.search)
    }
  }

  if (appointments.length === 0) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">আজ কোনো appointment নেই</h3>
          <p className="text-gray-500">নতুন appointments আসলে এখানে দেখা যাবে</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {appointments.map((appointment) => {
          const appointmentDate = new Date(appointment.appointment_date)
          const now = new Date()
          const canJoin = appointmentDate.getTime() - now.getTime() < 15 * 60 * 1000 // 15 minutes before
          const isPast = appointmentDate < now

          return (
            <Card key={appointment.id} className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-emerald-50/50">
                <CardTitle className="text-lg text-emerald-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {appointment.patient_name}
                  </span>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      isPast
                        ? "bg-gray-200 text-gray-700"
                        : canJoin
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isPast ? "সম্পন্ন" : canJoin ? "এখনই join করুন" : "আসছে"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-emerald-900 text-sm uppercase tracking-wide">রোগীর তথ্য</h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        {appointment.patient_email}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        {appointment.patient_phone}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-emerald-900 text-sm uppercase tracking-wide">সময়</h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        {appointmentDate.toLocaleDateString("bn-BD", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        {appointmentDate.toLocaleTimeString("bn-BD", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="mt-4 pt-4 border-t border-emerald-100">
                    <h4 className="font-semibold text-emerald-900 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      রোগীর সমস্যা
                    </h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{appointment.symptoms}</p>
                  </div>
                )}

                <div className="mt-6">
                  {canJoin && !isPast ? (
                    <Button
                      onClick={() => handleJoinVideoCall(appointment)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-6"
                    >
                      <Video className="w-5 h-5 mr-2" />
                      ভিডিও কল শুরু করুন
                    </Button>
                  ) : isPast ? (
                    <Button disabled className="w-full bg-gray-300 text-gray-600 cursor-not-allowed">
                      Consultation সম্পন্ন হয়েছে
                    </Button>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-blue-800 text-sm">Appointment এর 15 মিনিট আগে ভিডিও কল join করতে পারবেন</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
