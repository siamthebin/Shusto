'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, MapPin, Beaker, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/kokonutui/bottom-nav'

interface Lab {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  license_number?: string
  owner_name?: string
  latitude?: number
  longitude?: number
  is_active?: boolean
  is_paused?: boolean
}

export default function LabsPage() {
  const router = useRouter()
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        console.log('[v0] Fetching labs from API...')
        const response = await fetch('/api/admin/labs')
        const data = await response.json()
        console.log('[v0] Labs received:', data.labs?.length || 0)
        
        if (data.labs) {
          setLabs(data.labs.filter((l: Lab) => l.is_active && !l.is_paused))
        }
        setLoading(false)
      } catch (err) {
        console.error('[v0] Error fetching labs:', err)
        setLoading(false)
      }
    }

    fetchLabs()
    
    // Re-fetch every 15 seconds for real-time updates
    const interval = setInterval(fetchLabs, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleBookTest = (lab: Lab) => {
    if (lab.phone) {
      window.open(`tel:${lab.phone}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ফিরে যান
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Beaker className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ল্যাব টেস্ট সেবা</h1>
            <p className="text-purple-100 text-sm">হোম স্যাম্পল কালেকশন</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600"></div>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-12">
            <Beaker className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">এখন কোনো ল্যাব উপলব্ধ নেই</p>
          </div>
        ) : (
          labs.map(lab => (
            <div key={lab.id} className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900">{lab.name}</h3>
                {lab.owner_name && (
                  <p className="text-sm text-gray-500">মালিক: {lab.owner_name}</p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {lab.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-purple-600" />
                    {lab.phone}
                  </div>
                )}

                {lab.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    {lab.address}
                  </div>
                )}

                {lab.license_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Beaker className="w-4 h-4 text-purple-600" />
                    লাইসেন্স: {lab.license_number}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-purple-600 font-semibold">
                  <Clock className="w-4 h-4" />
                  হোম স্যাম্পল কালেকশন উপলব্ধ
                </div>
              </div>

              <Button 
                onClick={() => handleBookTest(lab)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                বুকিং করুন
              </Button>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
