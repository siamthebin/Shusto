"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Beaker, Mail, Phone, MapPin, User, AlertCircle } from "lucide-react"

export default function LabRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    ownerName: "",
    tests: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/add-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          license_number: formData.licenseNumber,
          owner_name: formData.ownerName,
          services: formData.tests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "নিবন্ধন ব্যর্থ হয়েছে")
      }

      // Save to localStorage as well
      const labs = JSON.parse(localStorage.getItem("shusto_labs") || "[]")
      labs.push({
        id: data.lab?.id || Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        license_number: formData.licenseNumber,
        owner_name: formData.ownerName,
      })
      localStorage.setItem("shusto_labs", JSON.stringify(labs))

      router.push("/registration-success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "একটি ত্রুটি ঘটেছে")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
              <Beaker className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">ল্যাব নিবন্ধন</h1>
          <p className="text-zinc-600">আমাদের প্ল্যাটফর্মে আপনার ডায়াগনস্টিক ল্যাব যোগ করুন</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Lab Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">ল্যাবের নাম *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="যেমন: আল-ইমাম ডায়াগনস্টিক"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">মালিকের নাম *</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              placeholder="মালিক বা প্রধান পরিচালকের নাম"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">ইমেল *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="lab@example.com"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
            <p className="text-xs text-zinc-500 mt-1">ড্যাশবোর্ড অ্যাক্সেসের জন্য ব্যবহার করুন</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">ফোন নম্বর *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+880123456789"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">ঠিকানা *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="সম্পূর্ণ ঠিকানা"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">লাইসেন্স নম্বর *</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
              placeholder="ল্যাব লাইসেন্স নম্বর"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          {/* Tests Offered */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">পরিচালিত টেস্ট সমূহ</label>
            <textarea
              name="tests"
              value={formData.tests}
              onChange={handleChange}
              placeholder="যেমন: রক্ত পরীক্ষা, ইকো, এক্স-রে, ইত্যাদি (ঐচ্ছিক)"
              rows={4}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "নিবন্ধন হচ্ছে..." : "ল্যাব নিবন্ধন করুন"}
          </button>

          <p className="text-xs text-zinc-500 text-center">
            আপনার তথ্য সুরক্ষিত এবং শুধুমাত্র যাচাইয়ের জন্য ব্যবহৃত হবে
          </p>
        </form>
      </div>
    </div>
  )
}
