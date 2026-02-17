"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck, Phone, Mail, MapPin, ArrowLeft, User } from "lucide-react"

export default function AddAmbulancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    driverName: "",
    vehicleNumber: "",
    type: "basic" as "basic" | "icu" | "nicu",
    address: "",
    latitude: "",
    longitude: "",
    baseFare: 300,
    pricePerKm: 20,
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/add-ambulance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          driver_name: formData.driverName,
          vehicle_number: formData.vehicleNumber,
          vehicle_type: formData.type,
          service_area: formData.address,
          address: formData.address
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "অ্যাম্বুলেন্স যোগ করতে সমস্যা হয়েছে")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/admin/ambulances"), 2000)
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">সফলভাবে যোগ হয়েছে!</h2>
          <p className="text-gray-600">অ্যাম্বুলেন্স সফলভাবে যোগ করা হয়েছে</p>
          <p className="text-sm text-red-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Ambulance Dashboard দেখা যাবে</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">নতুন অ্যাম্বুলেন্স যোগ করুন</h1>
            <p className="text-red-100 text-sm">অ্যাম্বুলেন্সের তথ্য পূরণ করুন</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4">{error}</div>
        )}
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" />
            সার্ভিস তথ্য
          </h3>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">সার্ভিসের নাম *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="যেমন: লাইফ সেভার অ্যাম্বুলেন্স"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">অ্যাম্বুলেন্স টাইপ *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="basic">বেসিক (সাধারণ)</option>
              <option value="icu">ICU (আইসিইউ সাপোর্ট)</option>
              <option value="nicu">NICU (নবজাতক)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">ইমেইল * (লগইন এ ব্যবহার হবে)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="ambulance@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">ফোন নম্বর *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" />
            ড্রাইভার ও গাড়ির তথ্য
          </h3>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">ড্রাইভারের নাম *</label>
            <input
              type="text"
              required
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="ড্রাইভারের পুরো নাম"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">গাড়ির নম্বর *</label>
            <input
              type="text"
              required
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="ঢাকা মেট্রো-ক-১২৩৪"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">ঠিকানা (স্ট্যান্ড/গ্যারেজ)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="সাধারণত যেখানে থাকে"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Latitude</label>
              <input
                type="text"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="23.8103"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Longitude</label>
              <input
                type="text"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="90.4125"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-zinc-900">ভাড়া নির্ধারণ</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">বেস ভাড়া (৳)</label>
              <input
                type="number"
                value={formData.baseFare}
                onChange={(e) => setFormData({ ...formData, baseFare: Number.parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">প্রতি কিমি (৳)</label>
              <input
                type="number"
                value={formData.pricePerKm}
                onChange={(e) => setFormData({ ...formData, pricePerKm: Number.parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-lg">
            <p className="text-sm text-zinc-600">
              উদাহরণ: ১০ কিমি দূরত্বে ভাড়া = ৳{formData.baseFare} + (১০ × ৳{formData.pricePerKm}) ={" "}
              <strong>৳{formData.baseFare + 10 * formData.pricePerKm}</strong>
            </p>
          </div>
        </div>

        {/* Revenue Info */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">
            <strong>রেভিনিউ শেয়ারিং:</strong> অ্যাম্বুলেন্স সার্ভিস পাবে 70%, Shusto পাবে 30%। জিওলোকেশন ভিত্তিক নিকটতম অ্যাম্বুলেন্স
            দেখাবে।
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "সংরক্ষণ হচ্ছে..." : "অ্যাম্বুলেন্স যোগ করুন"}
        </button>
      </form>
    </div>
  )
}
