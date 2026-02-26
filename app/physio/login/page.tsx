'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PhysioLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/physio/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'এই email দিয়ে কোনো থেরাপিস্ট পাওয়া যায়নি')
        setLoading(false)
        return
      }

      localStorage.setItem('physioEmail', email)
      localStorage.setItem('physioData', JSON.stringify(data.physiotherapist))
      router.push('/physio/dashboard')
    } catch (err) {
      setError('লগইন এ সমস্যা হয়েছে।')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700 mb-2">ফিজিওথেরাপি ড্যাশবোর্ড</h1>
          <p className="text-gray-600">আপনার email দিয়ে লগইন করুন</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="physio@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'লগইন করছি...' : 'লগইন করুন'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          এখনও রেজিস্টার করেননি?{' '}
          <Link href="/physio/register" className="text-teal-600 hover:underline font-semibold">
            এখানে ক্লিক করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
