"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Stethoscope } from "lucide-react"

export default function DoctorRegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    specialty: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    bio: "",
    phoneNumber: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (authError) throw authError

      // Create doctor profile in database
      if (authData.user) {
        const { error: profileError } = await supabase.from("doctors").insert({
          id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
          specialty: formData.specialty,
          qualification: formData.qualification,
          experience_years: Number.parseInt(formData.experience),
          consultation_fee: Number.parseInt(formData.consultationFee),
          bio: formData.bio,
          phone_number: formData.phoneNumber,
          is_available: true,
          rating: 5.0,
        })

        if (profileError) throw profileError
      }

      // Redirect to success page
      router.push("/doctor-portal/registration-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "রেজিস্ট্রেশন ব্যর্থ হয়েছে")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/doctor-portal" className="flex items-center gap-2">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-3xl text-emerald-600">Shusto</span>
                <span className="text-sm text-gray-600">ডাক্তার পোর্টাল</span>
              </div>
            </Link>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl text-center font-bold">ডাক্তার রেজিস্ট্রেশন</CardTitle>
              <CardDescription className="text-center text-base">আপনার প্রফেশনাল প্রফাইল তৈরি করুন</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">ব্যক্তিগত তথ্য</h3>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">পূর্ণ নাম *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="ডাঃ আবদুল করিম"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">ইমেইল *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="doctor@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">ফোন নম্বর *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                        placeholder="০১৭xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">পাসওয়ার্ড *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="কমপক্ষে ৬ সংখ্যার"
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">পেশাগত তথ্য</h3>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">বিশেষজ্ঞতা *</Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="বিশেষজ্ঞতা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="সাধারণ চিকিৎসক">সাধারণ চিকিৎসক</SelectItem>
                        <SelectItem value="হৃদরোগ বিশেষজ্ঞ">হৃদরোগ বিশেষজ্ঞ</SelectItem>
                        <SelectItem value="শিশু বিশেষজ্ঞ">শিশু বিশেষজ্ঞ</SelectItem>
                        <SelectItem value="নারী ও প্রসূতি বিশেষজ্ঞ">নারী ও প্রসূতি বিশেষজ্ঞ</SelectItem>
                        <SelectItem value="চর্ম বিশেষজ্ঞ">চর্ম বিশেষজ্ঞ</SelectItem>
                        <SelectItem value="মানসিক রোগ বিশেষজ্ঞ">মানসিক রোগ বিশেষজ্ঞ</SelectItem>
                        <SelectItem value="অর্থোপেডিক সার্জন">অর্থোপেডিক সার্জন</SelectItem>
                        <SelectItem value="নিউরোলজিস্ট">নিউরোলজিস্ট</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification">যোগ্যতা *</Label>
                    <Input
                      id="qualification"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      required
                      placeholder="MBBS, FCPS (Medicine)"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">অভিজ্ঞতা (বছর) *</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        required
                        placeholder="১৫"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationFee">পরামর্শ ফি (টাকা) *</Label>
                      <Input
                        id="consultationFee"
                        type="number"
                        value={formData.consultationFee}
                        onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                        required
                        placeholder="৮০০"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">সংক্ষিপ্ত পরিচিতি</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="আপনার পেশাগত অভিজ্ঞতা ও দক্ষতা সম্পর্কে লিখুন..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্টার করুন"}
                </Button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                    <Link href="/doctor-portal/login" className="text-emerald-600 font-semibold hover:underline">
                      লগইন করুন
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
