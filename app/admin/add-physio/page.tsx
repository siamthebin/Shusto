"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Mail, Phone, MapPin, User, Clock } from "lucide-react"
import Link from "next/link"

export default function AddPhysioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    license_number: "",
    specialization: "physiotherapy",
    experience_years: "",
    services: [
      { name: "হোম ফিজিওথেরাপি", price: 800, duration: "1 ঘন্টা" },
      { name: "স্ট্রোক রিহ্যাবিলিটেশন", price: 1000, duration: "1.5 ঘন্টা" },
      { name: "পোস্ট সার্জারি কেয়ার", price: 1200, duration: "2 ঘন্টা" },
    ],
    latitude: 0,
    longitude: 0,
  })

  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/add-physio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          specialization: formData.specialization,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          consultation_fee: formData.services[0]?.price || 800
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "ফিজিও যোগ করতে সমস্যা হয়েছে")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/admin/physios"), 2000)
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  const updateService = (index: number, field: string, value: any) => {
    const newServices = [...formData.services]
    newServices[index] = { ...newServices[index], [field]: value }
    setFormData({ ...formData, services: newServices })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">সফলভাবে যোগ হয়েছে!</h2>
          <p className="text-gray-600">ফিজিওথেরাপিস্ট সফলভাবে যোগ করা হয়েছে</p>
          <p className="text-sm text-pink-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Physio Dashboard দেখা যাবে</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-8 pt-20">
        <Link href="/" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>ফিরে যান</span>
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">নতুন ফিজিও/নার্সিং যোগ করুন</h1>
                  <p className="text-pink-100">সেবাদাতার তথ্য পূরণ করুন</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="সেবাদাতার নাম লিখুন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">সেবার ধরন *</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="physiotherapy">ফিজিওথেরাপি</option>
                    <option value="nursing">নার্সিং কেয়ার</option>
                    <option value="elderly_care">বয়স্ক সেবা</option>
                    <option value="post_surgery">পোস্ট সার্জারি কেয়ার</option>
                    <option value="stroke_rehab">স্ট্রোক রিহ্যাবিলিটেশন</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    ইমেইল * (লগইন এ ব্যবহার হবে)
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="physio@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    ফোন নম্বর
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    ঠিকানা
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    rows={2}
                    placeholder="সম্পূর্ণ ঠিকানা"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">অভিজ্ঞতা (বছর)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="5"
                  />
                </div>

                {/* Services */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 inline mr-2" />
                    সেবাসমূহ ও মূল্য
                  </label>
                  {formData.services.map((service, index) => (
                    <div key={index} className="p-3 bg-pink-50 rounded-lg grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(index, "name", e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="সেবার নাম"
                      />
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(index, "price", Number.parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="মূল্য (৳)"
                      />
                      <input
                        type="text"
                        value={service.duration}
                        onChange={(e) => updateService(index, "duration", e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="সময়"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        services: [...formData.services, { name: "", price: 0, duration: "" }],
                      })
                    }
                    className="w-full py-2 border-2 border-dashed border-pink-300 rounded-lg text-pink-500 hover:border-pink-500"
                  >
                    + নতুন সেবা যোগ করুন
                  </button>
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <p className="text-sm text-pink-800">
                  <strong>রেভিনিউ শেয়ারিং:</strong> সেবাদাতা পাবে 70%, Shusto পাবে 30%।
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
              >
                {loading ? "যোগ করা হচ্ছে..." : "ফিজিও/নার্সিং যোগ করুন"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
