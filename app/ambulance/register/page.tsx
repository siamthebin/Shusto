"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck, Mail, Phone, MapPin, User, AlertCircle, PlusCircle } from "lucide-react"

export default function AmbulanceRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicleNumber: "",
    type: "সাধারণ",
    driverName: "",
    driverPhone: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const response = await fetch("/api/admin/add-ambulance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          vehicle_number: formData.vehicleNumber,
          vehicle_type: formData.type,
          driver_name: formData.driverName,
          driver_phone: formData.driverPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "নিবন্ধন ব্যর্থ হয়েছে")
      }

      // Save to localStorage as well
      const ambulances = JSON.parse(localStorage.getItem("shusto_ambulances") || "[]")
      ambulances.push({
        id: data.ambulance?.id || Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        vehicleNumber: formData.vehicleNumber,
        type: formData.type,
        driverName: formData.driverName,
      })
      localStorage.setItem("shusto_ambulances", JSON.stringify(ambulances))

      router.push("/registration-success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "একটি ত্রুটি ঘটেছে")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">অ্যাম্বুলেন্স নিবন্ধন</h1>
          <p className="text-zinc-600">আমাদের নেটওয়ার্কে আপনার অ্যাম্বুলেন্স সেবা যোগ করুন</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Service Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">সেবার নাম *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="যেমন: দ্রুত অ্যাম্বুলেন্স সেবা"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            />
          </div>

          {/* Owner/Manager Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">মালিক/ম্যানেজারের নাম *</label>
            <input
              type="text"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              required
              placeholder="নাম"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
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
              placeholder="ambulance@example.com"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            />
            <p className="text-xs text-zinc-500 mt-1">এই ইমেলে লগইন করে অর্ডার ম্যানেজ করতে পারবেন</p>
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
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            />
          </div>

          {/* Driver Phone */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">ড্রাইভারের ফোন</label>
            <input
              type="tel"
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleChange}
              placeholder="+880123456789"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            />
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">গাড়ির নম্বর *</label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              required
              placeholder="যেমন: ঢাকা-৪৫-৭৮৯০"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            />
          </div>

          {/* Ambulance Type */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">অ্যাম্বুলেন্সের ধরন *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            >
              <option value="সাধারণ">সাধারণ</option>
              <option value="জরুরি">জরুরি</option>
              <option value="এআইসি">এআইসি</option>
              <option value="এক্সক্লুসিভ">এক্সক্লুসিভ</option>
            </select>
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
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">বর্ণনা</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="সেবা সম্পর্কে বর্ণনা (ঐচ্ছিক)"
              rows={4}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "নিবন্ধন হচ্ছে..." : "অ্যাম্বুলেন্স নিবন্ধন করুন"}
          </button>

          <p className="text-xs text-zinc-500 text-center">
            আপনার তথ্য সম্পূর্ণ সুরক্ষিত এবং গোপনীয় থাকবে
          </p>
        </form>
      </div>
    </div>
  )
}
