"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Clock, Award } from "lucide-react"
import { useState } from "react"
import BookingModal from "./booking-modal"

interface Doctor {
  id: string
  name: string
  specialty: string
  qualifications: string
  experience_years: number
  consultation_fee: number
  bio: string
  avatar_url?: string
}

export default function DoctorsList({ doctors }: { doctors: Doctor[] }) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden border-emerald-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                  {doctor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-emerald-900">{doctor.name}</h3>
                  <p className="text-sm text-emerald-600">{doctor.specialty}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="w-4 h-4" />
                  <span>{doctor.qualifications}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{doctor.experience_years} বছরের অভিজ্ঞতা</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{doctor.bio}</p>

              <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                <div className="text-lg font-bold text-emerald-700">৳{doctor.consultation_fee}</div>
                <Button onClick={() => setSelectedDoctor(doctor)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Video className="w-4 h-4 mr-2" />
                  পরামর্শ নিন
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDoctor && <BookingModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />}
    </>
  )
}
