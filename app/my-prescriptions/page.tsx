"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Medicine {
  name: string
  dosage: string
  duration: string
  timing: string
}

interface Prescription {
  id: number
  doctor_name: string
  doctor_specialization: string
  diagnosis: string
  medicines: Medicine[]
  instructions: string
  follow_up_date: string
  created_at: string
}

export default function MyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadPrescriptions()
  }, [])

  const loadPrescriptions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        window.location.href = "/auth/login"
        return
      }

      setUserEmail(user.email)

      const response = await fetch(`/api/prescriptions?patient_email=${encodeURIComponent(user.email)}`)
      const data = await response.json()

      if (data.prescriptions) {
        setPrescriptions(data.prescriptions)
      }
    } catch (error) {
      console.error("Error loading prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
            <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-emerald-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
                ← ফিরে যান
              </Link>
              <h1 className="text-2xl font-bold">আমার প্রেসক্রিপশন</h1>
              <p className="text-emerald-100 text-sm mt-1">আপনার সব প্রেসক্রিপশন এক জায়গায়</p>
              <p className="text-emerald-100 text-xs mt-2">লগইন: {userEmail}</p>
            </div>
            <Button onClick={loadPrescriptions} variant="secondary" size="sm">
              রিফ্রেশ
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-md">
          {prescriptions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">কোনো প্রেসক্রিপশন নেই</h3>
              <p className="text-gray-600 mb-6">আপনি এখনো কোনো প্রেসক্রিপশন পাননি</p>
              <Link href="/doctors">
                <Button className="bg-emerald-600 hover:bg-emerald-700">ডাক্তার খুঁজুন</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{prescription.doctor_name}</h3>
                      <p className="text-sm text-emerald-600">{prescription.doctor_specialization}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(prescription.created_at).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {prescription.diagnosis && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">রোগ নির্ণয়:</h4>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{prescription.diagnosis}</p>
                    </div>
                  )}

                  {prescription.medicines && prescription.medicines.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">ওষুধের তালিকা:</h4>
                      <div className="space-y-2">
                        {prescription.medicines.map((medicine, index) => (
                          <div key={index} className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{medicine.name}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  ডোজ: {medicine.dosage} | সময়: {medicine.timing}
                                </p>
                                <p className="text-sm text-emerald-700 mt-1">সময়কাল: {medicine.duration}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.instructions && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">পরামর্শ:</h4>
                      <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        {prescription.instructions}
                      </p>
                    </div>
                  )}

                  {prescription.follow_up_date && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        পরবর্তী ভিজিট:{" "}
                        {new Date(prescription.follow_up_date).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
