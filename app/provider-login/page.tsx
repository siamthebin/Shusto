'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Mail } from 'lucide-react'

export default function ProviderLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check which provider type this email belongs to
      const hospitals = JSON.parse(localStorage.getItem('shusto_hospitals') || '[]')
      const ambulances = JSON.parse(localStorage.getItem('shusto_ambulances') || '[]')
      const labs = JSON.parse(localStorage.getItem('shusto_labs') || '[]')
      const pharmacies = JSON.parse(localStorage.getItem('shusto_pharmacies') || '[]')
      const physios = JSON.parse(localStorage.getItem('shusto_physios') || '[]')

      const hospital = hospitals.find((h: any) => h.email?.toLowerCase() === email.toLowerCase())
      const ambulance = ambulances.find((a: any) => a.email?.toLowerCase() === email.toLowerCase())
      const lab = labs.find((l: any) => l.email?.toLowerCase() === email.toLowerCase())
      const pharmacy = pharmacies.find((p: any) => p.email?.toLowerCase() === email.toLowerCase())
      const physio = physios.find((p: any) => p.email?.toLowerCase() === email.toLowerCase())

      if (!hospital && !ambulance && !lab && !pharmacy && !physio) {
        throw new Error('এই ইমেইল নিবন্ধিত নয়')
      }

      // Store login info in localStorage
      localStorage.setItem('provider_logged_in', JSON.stringify({
        email,
        type: hospital ? 'hospital' : ambulance ? 'ambulance' : lab ? 'lab' : pharmacy ? 'pharmacy' : 'physio',
      }))

      // Redirect to appropriate dashboard
      if (hospital) {
        router.push('/hospital/dashboard')
      } else if (ambulance) {
        router.push('/ambulance/dashboard')
      } else if (lab) {
        router.push('/lab/dashboard')
      } else if (pharmacy) {
        router.push('/pharmacy/orders')
      } else if (physio) {
        router.push('/physio/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            প্রোভাইডার লগইন
          </h1>
          <p className="text-center text-slate-600 mb-6">
            আপনার অ্যাকাউন্টে লগইন করুন
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ইমেইল
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="আপনার ইমেইল"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="পাসওয়ার্ড"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-center text-slate-600 text-sm mb-4">
              অ্যাকাউন্ট নেই?
            </p>
            <button
              onClick={() => router.push('/provider-register')}
              className="w-full bg-slate-100 text-slate-900 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-all"
            >
              এখনই নিবন্ধন করুন
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-6">
            বিঃদ্রঃ এই ডেমোতে পাসওয়ার্ড যাচাই হচ্ছে না
          </p>
        </div>
      </div>
    </div>
  )
}
