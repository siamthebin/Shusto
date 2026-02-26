"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function DoctorRegistrationForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    qualifications: "",
    experienceYears: "",
    consultationFee: "",
    bmdcNumber: "",
    bio: "",
    phone: "",
    email: "",
    availableDays: [] as string[],
  })

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!userId) {
      setError("অনুগ্রহ করে প্রথমে লগইন করুন")
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from("doctor_profiles").insert({
        id: userId,
        specialization: formData.specialty,
        qualification: formData.qualifications,
        experience_years: Number.parseInt(formData.experienceYears),
        consultation_fee: Number.parseFloat(formData.consultationFee),
        bmdc_number: formData.bmdcNumber,
        bio: formData.bio,
        available_days: formData.availableDays,
        verification_status: "pending",
      })

      if (insertError) throw insertError

      router.push("/doctor/verification-pending")
    } catch (err: any) {
      setError(err.message || "রেজিস্ট্রেশন করতে সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const weekDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"]

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      availableDays: formData.availableDays.includes(day)
        ? formData.availableDays.filter((d) => d !== day)
        : [...formData.availableDays, day],
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>বিঃদ্রঃ</strong> রেজিস্ট্রেশন করার পরে Shusto admin আপনার BMDC registration verify করবে। Approve হলে তখন
            আপনি doctor dashboard access পাবেন।
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">পূর্ণ নাম *</Label>
            <Input
              id="name"
              name="name"
              placeholder="ডা. মোহাম্মদ রহমান"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">বিশেষত্ব *</Label>
            <Input
              id="specialty"
              name="specialty"
              placeholder="হৃদরোগ বিশেষজ্ঞ"
              value={formData.specialty}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bmdcNumber">BMDC Registration Number *</Label>
          <Input
            id="bmdcNumber"
            name="bmdcNumber"
            placeholder="A-12345"
            value={formData.bmdcNumber}
            onChange={handleChange}
            required
          />
          <p className="text-xs text-muted-foreground">
            Bangladesh Medical & Dental Council এর registration number দিন
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qualifications">যোগ্যতা *</Label>
          <Input
            id="qualifications"
            name="qualifications"
            placeholder="MBBS, FCPS (Cardiology)"
            value={formData.qualifications}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="experienceYears">অভিজ্ঞতা (বছর) *</Label>
            <Input
              id="experienceYears"
              name="experienceYears"
              type="number"
              placeholder="১৫"
              value={formData.experienceYears}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationFee">পরামর্শ ফি (টাকা) *</Label>
            <Input
              id="consultationFee"
              name="consultationFee"
              type="number"
              placeholder="১০০০"
              value={formData.consultationFee}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">ইমেইল *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="doctor@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">ফোন নম্বর *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="০১৭১২৩৪৫৬৭৮"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>সপ্তাহে কোন দিন available থাকবেন?</Label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-md border-2 transition-all ${
                  formData.availableDays.includes(day)
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">নিজের সম্পর্কে *</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="আপনার অভিজ্ঞতা ও বিশেষত্ব সম্পর্কে লিখুন..."
            value={formData.bio}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
          {loading ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন সম্পন্ন করুন"}
        </Button>
      </form>
    </div>
  )
}
