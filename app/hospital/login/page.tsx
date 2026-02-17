'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HospitalLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('[v0] Attempting hospital login with email:', email)
      
      // Check if hospital exists in database
      const response = await fetch(`/api/hospital/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      console.log('[v0] Login response:', data)

      if (!response.ok) {
        setError(data.error || 'এই email দিয়ে কোনো হাসপাতাল পাওয়া যায়নি')
        setLoading(false)
        return
      }

      // Store hospital data in localStorage
      localStorage.setItem('hospitalEmail', email)
      localStorage.setItem('hospitalData', JSON.stringify(data.hospital))
      localStorage.setItem('hospitalSession', 'true')

      console.log('[v0] Hospital login successful')
      router.push('/hospital/dashboard')
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('লগইন এ সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">হাসপাতাল ড্যাশবোর্ড</h1>
          <p className="text-gray-600">আপনার email দিয়ে লগইন করুন</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hospital@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'লগইন করছি...' : 'লগইন করুন'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          এখনও রেজিস্টার করেননি?{' '}
          <Link href="/hospital/register" className="text-emerald-600 hover:underline font-semibold">
            এখানে ক্লিক করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
