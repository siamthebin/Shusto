"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, User } from "lucide-react"
import Link from "next/link"

export default function AddPharmacyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    license_number: "",
    owner_name: "",
    latitude: 0,
    longitude: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/add-pharmacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "ফার্মেসি যোগ করতে সমস্যা হয়েছে")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/admin/pharmacies"), 2000)
    } catch (err) {
      setError("সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">সফলভাবে যোগ হয়েছে!</h2>
          <p className="text-gray-600">ফার্মেসি সফলভাবে যোগ করা হয়েছে</p>
          <p className="text-sm text-emerald-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Pharmacy Dashboard দেখা যাবে</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8 pt-20">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>ফিরে যান</span>
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">নতুন ফার্মেসি যোগ করুন</h1>
                  <p className="text-emerald-100">ফার্মেসির তথ্য পূরণ করুন</p>
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
                    <Building2 className="w-4 h-4 inline mr-2" />
                    ফার্মেসির নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="ফার্মেসির নাম লিখুন"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="pharmacy@example.com"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">অক্ষাংশ (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: Number.parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="23.8103"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">দ্রাঘিমাংশ (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: Number.parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="90.4125"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    লাইসেন্স নম্বর
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="ড্রাগ লাইসেন্স নম্বর"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    মালিকের নাম
                  </label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="মালিকের পূর্ণ নাম"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
              >
                {loading ? "যোগ করা হচ্ছে..." : "ফার্মেসি যোগ করুন"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
