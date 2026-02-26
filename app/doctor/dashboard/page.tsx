"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, TrendingUp, Upload } from "lucide-react"
import Link from "next/link"

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadDoctorData()
  }, [])

  const loadDoctorData = async () => {
    try {
      const response = await fetch("/api/doctor/profile")
      if (!response.ok) {
        router.push("/")
        return
      }
      const data = await response.json()
      setDoctor(data.doctor)
    } catch (error) {
      console.error("[v0] Error loading doctor data:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUpdateMessage({ type: "error", text: "শুধু ছবি ফাইল upload করুন" })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUpdateMessage({ type: "error", text: "ছবির সাইজ ৫MB এর কম হতে হবে" })
      return
    }

    setUploading(true)
    setUpdateMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Photo upload failed")

      const { url } = await uploadResponse.json()

      const updateResponse = await fetch("/api/doctor/update-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: url }),
      })

      if (!updateResponse.ok) throw new Error("Profile update failed")

      setDoctor({ ...doctor, photo_url: url })
      setUpdateMessage({ type: "success", text: "ছবি সফলভাবে পরিবর্তন হয়েছে!" })
    } catch (error) {
      setUpdateMessage({ type: "error", text: "ছবি পরিবর্তন করতে সমস্যা হয়েছে" })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">আপনি ডাক্তার হিসেবে নিবন্ধিত নন</p>
          <Link href="/">
            <Button className="mt-4">হোম এ ফিরে যান</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">ডাক্তার ড্যাশবোর্ড</h1>
            <p className="text-sm text-gray-600">স্বাগতম, ডা. {doctor.name}</p>
          </div>
          <Link href="/">
            <Button variant="outline">হোম</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {updateMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              updateMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {updateMessage.text}
          </div>
        )}

        {/* Profile Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>প্রোফাইল তথ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={doctor.photo_url || "/placeholder.svg?height=120&width=120"}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-emerald-100"
                />
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h2>
                <p className="text-emerald-600 font-medium mb-3">{doctor.specialty}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">BMDC</p>
                    <p className="font-semibold text-gray-900">{doctor.bmdc_number}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">অভিজ্ঞতা</p>
                    <p className="font-semibold text-gray-900">{doctor.experience_years} বছর</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">পরামর্শ ফি</p>
                    <p className="font-semibold text-gray-900">৳{doctor.consultation_fee}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">ইমেইল</p>
                    <p className="font-semibold text-gray-900 text-xs truncate">{doctor.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">মোট পরামর্শ</CardTitle>
              <Calendar className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">0</div>
              <p className="text-xs text-gray-600 mt-1">এখনও কোনো পরামর্শ নেই</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">মোট রোগী</CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">0</div>
              <p className="text-xs text-gray-600 mt-1">নতুন রোগী আসুক</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">রেটিং</CardTitle>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">5.0★</div>
              <p className="text-xs text-gray-600 mt-1">দুর্দান্ত!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>দ্রুত অ্যাকশন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/doctor/payment-settings">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  পেমেন্ট সেটিংস
                </Button>
              </Link>
              <Link href="/doctors">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                  ডাক্তারদের তালিকা দেখুন
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
