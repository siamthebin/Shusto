'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  specialization: string
  experience_years: string
}

export default function PhysioRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience_years: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/add-physio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          specialization: formData.specialization,
          experience_years: formData.experience_years,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'নিবন্ধন ব্যর্থ হয়েছে')
      }

      // Save to localStorage as well
      const physios = JSON.parse(localStorage.getItem('shusto_physios') || '[]')
      physios.push({
        id: data.physiotherapist?.id || Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        specialization: formData.specialization,
        experience_years: formData.experience_years,
      })
      localStorage.setItem('shusto_physios', JSON.stringify(physios))

      router.push('/registration-success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'একটি ত্রুটি ঘটেছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-pink-700 hover:text-pink-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-900 mb-2">ফিজিওথেরাপিস্ট নিবন্ধন</h1>
          <p className="text-pink-700">আপনার ক্লিনিক সাথে শুস্টো যুক্ত করুন</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">নাম *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="আপনার নাম"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ইমেইল *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="আপনার ইমেইল"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ফোন নম্বর *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="আপনার ফোন নম্বর"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">বিশেষত্ব *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">বেছে নিন</option>
                  <option value="orthopedic">অর্থোপেডিক</option>
                  <option value="sports">ক্রীড়া ফিজিওথেরাপি</option>
                  <option value="neurology">নিউরোলজি</option>
                  <option value="cardio">কার্ডিও</option>
                  <option value="pediatric">পেডিয়াট্রিক</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">অভিজ্ঞতা (বছর) *</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="অভিজ্ঞতার বছর"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ঠিকানা *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="আপনার ক্লিনিকের সম্পূর্ণ ঠিকানা"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন করুন'}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            ইতিমধ্যে অ্যাকাউন্ট আছে? ইমেইল দিয়ে লগইন করুন
          </p>
        </div>
      </div>
    </div>
  )
}
