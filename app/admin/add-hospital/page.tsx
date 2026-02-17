"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, MapPin, Phone, Mail, Bed, ArrowLeft } from "lucide-react"

export default function AddHospitalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
    licenseNumber: "",
    services: [
      { name: "জেনারেল বেড", type: "bed", price: 500, available: 10, total: 50 },
      { name: "ICU বেড", type: "icu", price: 5000, available: 5, total: 10 },
      { name: "কেবিন", type: "cabin", price: 3000, available: 8, total: 20 },
    ],
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/add-hospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          specialties: formData.services.map(s => s.name),
          bed_count: formData.services.reduce((sum, s) => sum + (s.total || 0), 0)
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "হাসপাতাল যোগ করতে সমস্যা হয়েছে")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/admin/hospitals"), 2000)
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">সফলভাবে যোগ হয়েছে!</h2>
          <p className="text-gray-600">হাসপাতাল সফলভাবে যোগ করা হয়েছে</p>
          <p className="text-sm text-blue-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Hospital Dashboard দেখা যাবে</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">নতুন হাসপাতাল যোগ করুন</h1>
            <p className="text-blue-100 text-sm">হাসপাতালের তথ্য পূরণ করুন</p>
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
            <Building2 className="w-5 h-5 text-blue-600" />
            মৌলিক তথ্য
          </h3>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">হাসপাতালের নাম *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
            />
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
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="hospital@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">ফোন নম্বর</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="02-XXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">ঠিকানা</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="সম্পূর্ণ ঠিকানা"
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
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="23.8103"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Longitude</label>
              <input
                type="text"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="90.4125"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">লাইসেন্স নম্বর</label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="DGHS-XXXX-XXXX"
            />
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <Bed className="w-5 h-5 text-blue-600" />
            সেবা ও মূল্য (তাৎক্ষণিক প্রকাশিত হবে)
          </h3>
          <p className="text-sm text-zinc-500">এই সেবাগুলো এডমিন অনুমোদন ছাড়াই সরাসরি রোগীদের কাছে দেখাবে।</p>

          {formData.services.map((service, index) => (
            <div key={index} className="p-4 bg-zinc-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => updateService(index, "name", e.target.value)}
                  className="font-medium text-zinc-900 bg-transparent border-b border-zinc-300 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={service.type}
                  onChange={(e) => updateService(index, "type", e.target.value)}
                  className="text-sm px-2 py-1 border border-zinc-300 rounded"
                >
                  <option value="bed">জেনারেল বেড</option>
                  <option value="icu">ICU/CCU</option>
                  <option value="cabin">কেবিন</option>
                  <option value="operation">অপারেশন</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-zinc-500">মূল্য (৳/দিন)</label>
                  <input
                    type="number"
                    value={service.price}
                    onChange={(e) => updateService(index, "price", Number.parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-zinc-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">উপলব্ধ</label>
                  <input
                    type="number"
                    value={service.available}
                    onChange={(e) => updateService(index, "available", Number.parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-zinc-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">মোট</label>
                  <input
                    type="number"
                    value={service.total}
                    onChange={(e) => updateService(index, "total", Number.parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-zinc-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                services: [...formData.services, { name: "নতুন সেবা", type: "bed", price: 0, available: 0, total: 0 }],
              })
            }
            className="w-full py-2 border-2 border-dashed border-zinc-300 rounded-lg text-zinc-500 hover:border-blue-500 hover:text-blue-500"
          >
            + নতুন সেবা যোগ করুন
          </button>
        </div>

        {/* Revenue Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>রেভিনিউ শেয়ারিং:</strong> হাসপাতাল পাবে 60%, Shusto পাবে 40%। সব বুকিং তাৎক্ষণিকভাবে প্রকাশিত হবে।
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "সংরক্ষণ হচ্ছে..." : "হাসপাতাল যোগ করুন"}
        </button>
      </form>
    </div>
  )
}
