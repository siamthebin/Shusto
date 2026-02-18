"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Calendar, Clock, User, Phone, Mail, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  appointment_date: string
  symptoms: string
  status: string
  payment_status: string
  payment_method?: string
  transaction_id?: string
  video_room_url: string
  doctors: {
    name: string
    specialty: string
    consultation_fee: number
  }
}

export default function AppointmentDetails({
  appointment,
}: {
  appointment: Appointment
}) {
  const router = useRouter()

  const appointmentDate = new Date(appointment.appointment_date)
  const now = new Date()
  const canJoin = appointmentDate.getTime() - now.getTime() < 15 * 60 * 1000 // 15 minutes before

  const canStartVideoCall = appointment.payment_status === "paid" && canJoin

  const handleJoinVideoCall = () => {
    if (appointment.video_room_url) {
      router.push(appointment.video_room_url)
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-emerald-200">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <Video className="w-6 h-6" />
              আপনার পরামর্শ বুকিং সফল হয়েছে!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {appointment.payment_status === "paid" ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />✓ পেমেন্ট সম্পন্ন হয়েছে
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {appointment.payment_method} • Transaction: {appointment.transaction_id}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />⚠ পেমেন্ট বাকি আছে
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  ভিডিও কল শুরু করতে প্রথমে ৳{appointment.doctors.consultation_fee} পেমেন্ট করুন
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-emerald-900 border-b pb-2">ডাক্তারের তথ্য</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">{appointment.doctors.name}</span>
                </p>
                <p className="text-sm text-gray-600 ml-6">{appointment.doctors.specialty}</p>
                <p className="text-sm text-gray-600 ml-6">পরামর্শ ফি: ৳{appointment.doctors.consultation_fee}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-emerald-900 border-b pb-2">রোগীর তথ্য</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  {appointment.patient_name}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  {appointment.patient_email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  {appointment.patient_phone}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-emerald-900 border-b pb-2">অ্যাপয়েন্টমেন্ট সময়</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {appointmentDate.toLocaleDateString("bn-BD", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {appointmentDate.toLocaleTimeString("bn-BD", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {appointment.symptoms && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-emerald-900 border-b pb-2">উপসর্গ</h3>
                <p className="text-gray-700">{appointment.symptoms}</p>
              </div>
            )}

            <div className="pt-4">
              {appointment.payment_status !== "paid" ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-800 font-semibold">ভিডিও কল শুরু করতে প্রথমে পেমেন্ট সম্পন্ন করুন</p>
                  <p className="text-sm text-red-700 mt-1">
                    পেমেন্ট করতে: bKash/Nagad এ ৳{appointment.doctors.consultation_fee} পাঠান 01XXXXXXXXX
                  </p>
                </div>
              ) : canStartVideoCall ? (
                <Button
                  onClick={handleJoinVideoCall}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                >
                  <Video className="w-5 h-5 mr-2" />
                  ভিডিও কলে কথা বলুন
                </Button>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-800">আপনি আপনার অ্যাপয়েন্টমেন্ট এর 15 মিনিট আগে ভিডিও কলে যোগ দিতে পারবেন</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
