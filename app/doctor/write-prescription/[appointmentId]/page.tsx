"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Medicine {
  name: string
  dosage: string
  duration: string
  timing: string
}

export default function WritePrescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const [appointment, setAppointment] = useState<any>(null)
  const [diagnosis, setDiagnosis] = useState("")
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: "", dosage: "", duration: "", timing: "" }])
  const [instructions, setInstructions] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadAppointment()
  }, [])

  const loadAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments?appointment_id=${params.appointmentId}`)
      const data = await response.json()

      if (data.appointments && data.appointments[0]) {
        setAppointment(data.appointments[0])
      }
    } catch (error) {
      console.error("Error loading appointment:", error)
    } finally {
      setLoading(false)
    }
  }

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", duration: "", timing: "" }])
  }

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines]
    updated[index][field] = value
    setMedicines(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("অনুগ্রহ করে লগইন করুন")
        return
      }

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: params.appointmentId,
          doctor_id: appointment.doctor_id,
          patient_email: appointment.patient_email,
          patient_name: appointment.patient_name,
          diagnosis,
          medicines: medicines.filter((m) => m.name.trim()),
          instructions,
          follow_up_date: followUpDate || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("প্রেসক্রিপশন সফলভাবে তৈরি হয়েছে!")
        router.push("/doctor/dashboard")
      } else {
        alert("প্রেসক্রিপশন তৈরি করতে সমস্যা হয়েছে")
      }
    } catch (error) {
      console.error("Error submitting prescription:", error)
      alert("একটি ত্রুটি ঘটেছে")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">অ্যাপয়েন্টমেন্ট পাওয়া যায়নি</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">প্রেসক্রিপশন লিখুন</h1>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900">{appointment.patient_name}</h3>
            <p className="text-sm text-gray-600">{appointment.patient_email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">রোগ নির্ণয়</label>
              <Textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="রোগের বিবরণ লিখুন..."
                rows={3}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">ওষুধের তালিকা</label>
                <Button type="button" onClick={addMedicine} size="sm" variant="outline">
                  + ওষুধ যোগ করুন
                </Button>
              </div>

              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ওষুধের নাম *</label>
                        <Input
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, "name", e.target.value)}
                          placeholder="যেমন: Napa 500mg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ডোজ *</label>
                        <Input
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                          placeholder="যেমন: ১টি করে"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">সময় *</label>
                        <Input
                          value={medicine.timing}
                          onChange={(e) => updateMedicine(index, "timing", e.target.value)}
                          placeholder="যেমন: দিনে ৩ বার খাবারের পরে"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">সময়কাল *</label>
                        <Input
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                          placeholder="যেমন: ৭ দিন"
                          required
                        />
                      </div>
                    </div>
                    {medicines.length > 1 && (
                      <Button type="button" onClick={() => removeMedicine(index)} size="sm" variant="destructive">
                        মুছে ফেলুন
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">পরামর্শ</label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="বিশেষ নির্দেশনা লিখুন..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">পরবর্তী ভিজিটের তারিখ</label>
              <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "সংরক্ষণ হচ্ছে..." : "প্রেসক্রিপশন সংরক্ষণ করুন"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                বাতিল
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
