"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Doctor {
  id: string
  specialization: string
  qualification: string
  experience_years: number
  bmdc_number: string
  consultation_fee: number
  rating: number
  user_profiles: {
    full_name: string
    phone: string
  }
}

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
    fetchDoctors()
  }, [])

  const checkAdmin = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    setUser(authUser)

    if (!authUser || authUser.email !== "shustobd@gmail.com") {
      window.location.href = "/"
    }
  }

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select(`
          *,
          user_profiles!inner (
            full_name,
            phone
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeDoctor = async (doctorId: string, doctorName: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে ${doctorName} কে ডাক্তার তালিকা থেকে সরাতে চান?`)) {
      return
    }

    try {
      // Delete from doctor_profiles
      const { error: deleteError } = await supabase.from("doctor_profiles").delete().eq("id", doctorId)

      if (deleteError) throw deleteError

      // Update user_profiles role to patient
      const { error: updateError } = await supabase.from("user_profiles").update({ role: "patient" }).eq("id", doctorId)

      if (updateError) throw updateError

      alert("ডাক্তার সফলভাবে সরানো হয়েছে!")
      fetchDoctors()
    } catch (error) {
      console.error("Error removing doctor:", error)
      alert("ডাক্তার সরাতে সমস্যা হয়েছে")
    }
  }

  const deleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে ${doctorName} এর account সম্পূর্ণ মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না!`)) {
      return
    }

    try {
      // Delete from doctor_profiles first (foreign key constraint)
      await supabase.from("doctor_profiles").delete().eq("id", doctorId)

      // Then delete from user_profiles
      const { error } = await supabase.from("user_profiles").delete().eq("id", doctorId)

      if (error) throw error

      alert("ডাক্তার account সফলভাবে মুছে ফেলা হয়েছে!")
      fetchDoctors()
    } catch (error) {
      console.error("Error deleting doctor:", error)
      alert("ডাক্তার মুছতে সমস্যা হয়েছে")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
            <p className="mt-4 text-zinc-600">লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-zinc-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">ডাক্তার ম্যানেজমেন্ট</h1>
            <p className="text-zinc-600 mt-2">সব ডাক্তার দেখুন, সরান বা মুছে ফেলুন</p>
          </div>
          <Link href="/admin/add-doctor">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              নতুন ডাক্তার যোগ করুন
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">নাম</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">বিশেষত্ব</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">BMDC নম্বর</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">অভিজ্ঞতা</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">ফি</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-900">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      কোনো ডাক্তার পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900">{doctor.user_profiles.full_name}</div>
                        <div className="text-sm text-zinc-500">{doctor.user_profiles.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{doctor.specialization}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{doctor.bmdc_number || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{doctor.experience_years} বছর</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">৳{doctor.consultation_fee}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeDoctor(doctor.id, doctor.user_profiles.full_name)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            সরান
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteDoctor(doctor.id, doctor.user_profiles.full_name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            মুছুন
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">গুরুত্বপূর্ণ তথ্য:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  <strong>সরান:</strong> ডাক্তারের role "patient" এ পরিবর্তন হবে। তারা আবার apply করতে পারবে।
                </li>
                <li>
                  <strong>মুছুন:</strong> ডাক্তারের account সম্পূর্ণ মুছে যাবে। এটি পুনরুদ্ধার করা যাবে না।
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
