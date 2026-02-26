"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Doctor {
  id: string
  name: string
  specialty: string
  qualifications: string
  experience_years: number
  consultation_fee: number
  bio: string
  available: boolean
}

export default function DoctorProfileView({ doctor }: { doctor: Doctor }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
            <p className="text-emerald-100 text-lg mb-3">{doctor.specialty}</p>
            <div className="flex items-center gap-2">
              <Badge variant={doctor.available ? "default" : "secondary"} className="bg-white/20">
                {doctor.available ? "অনলাইন" : "অফলাইন"}
              </Badge>
            </div>
          </div>
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            প্রোফাইল এডিট করুন
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">যোগ্যতা</p>
            <p className="font-semibold text-gray-900">{doctor.qualifications}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">অভিজ্ঞতা</p>
            <p className="font-semibold text-gray-900">{doctor.experience_years} বছর</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">পরামর্শ ফি</p>
            <p className="font-semibold text-gray-900">৳{doctor.consultation_fee}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">নিজের সম্পর্কে</h2>
          <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">দ্রুত পরিসংখ্যান</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600 mt-1">আজকের পরামর্শ</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-1">মোট পরামর্শ</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600 mt-1">সক্রিয় রোগী</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-orange-600">৳0</p>
              <p className="text-sm text-gray-600 mt-1">এই মাসের আয়</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
