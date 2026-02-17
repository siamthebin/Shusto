"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Doctor {
  id: string
  name: string
  specialty: string
  consultation_fee: number
  image_url: string
}

export default function BookAppointmentPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter()
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    patient_age: "",
    symptoms: "",
    appointment_date: "",
    appointment_time: "",
  })

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = params instanceof Promise ? await params : params
        setDoctorId(resolvedParams.id)
      } catch (error) {
        console.error("[v0] Error resolving params:", error)
      }
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (doctorId) {
      fetchDoctor()
    }
  }, [doctorId])

  const fetchDoctor = async () => {
    if (!doctorId) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, specialty, consultation_fee, image_url")
        .eq("id", doctorId)
        .single()

      if (error) throw error
      setDoctor(data)
    } catch (error) {
      console.error("[v0] Error fetching doctor:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId || !doctor) return

    setSubmitting(true)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          doctor_name: doctor.name,
          patient_name: formData.patient_name,
          patient_phone: formData.patient_phone,
          symptoms: formData.symptoms,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create appointment")
      }

      alert("অ্যাপয়েন্টমেন্ট সফলভাবে বুক করা হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।")
      router.push("/doctors")
    } catch (error) {
      console.error("[v0] Error booking appointment:", error)
      alert("সমস্যা: Failed to create appointment")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">ডাক্তার পাওয়া যায়নি</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={doctor.image_url || "/placeholder.svg"}
              alt={doctor.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
              <p className="text-emerald-600">{doctor.specialty}</p>
              <p className="text-sm text-gray-600">পরামর্শ ফি: ৳{doctor.consultation_fee}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">অ্যাপয়েন্টমেন্ট বুক করুন</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">রোগীর নাম *</label>
              <input
                type="text"
                required
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="আপনার নাম লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">মোবাইল নম্বর *</label>
              <input
                type="tel"
                required
                value={formData.patient_phone}
                onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="০১XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">বয়স *</label>
              <input
                type="number"
                required
                value={formData.patient_age}
                onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="বয়স লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">লক্ষণ / সমস্যা *</label>
              <textarea
                required
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="আপনার স্বাস্থ্য সমস্যা বিস্তারিত লিখুন"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">তারিখ *</label>
                <input
                  type="date"
                  required
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">সময় *</label>
                <input
                  type="time"
                  required
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "বুক করা হচ্ছে..." : "নিশ্চিত করুন"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
