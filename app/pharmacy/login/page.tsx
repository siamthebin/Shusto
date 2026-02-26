'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PharmacyLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/pharmacy/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'এই email দিয়ে কোনো ফার্মেসি পাওয়া যায়নি')
        setLoading(false)
        return
      }

      localStorage.setItem('pharmacyEmail', email)
      localStorage.setItem('pharmacyData', JSON.stringify(data.pharmacy))
      router.push('/pharmacy/dashboard')
    } catch (err) {
      setError('লগইন এ সমস্যা হয়েছে।')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">ফার্মেসি ড্যাশবোর্ড</h1>
          <p className="text-gray-600">আপনার email দিয়ে লগইন করুন</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ইমেইল</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pharmacy@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {loading ? 'লগ ইন হচ্ছে...' : 'লগ ইন করুন'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/provider-login" className="text-emerald-600 hover:underline">
            অন্যান্য প্রোভাইডার হিসেবে লগ ইন করুন
          </Link>
        </div>
      </div>
    </div>
  )
}
