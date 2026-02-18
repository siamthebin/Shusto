'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, MapPin, Award, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/kokonutui/bottom-nav'

interface Physiotherapist {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  specialization?: string
  experience_years?: number
  consultation_fee?: number
  qualification?: string
  is_active?: boolean
  is_available?: boolean
}

export default function PhysiosPage() {
  const router = useRouter()
  const [physios, setPhysios] = useState<Physiotherapist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPhysios = async () => {
      try {
        console.log('[v0] Fetching physios from API...')
        const response = await fetch('/api/admin/physios')
        const data = await response.json()
        console.log('[v0] Physios received:', data.physios?.length || 0)
        
        if (data.physios) {
          setPhysios(data.physios.filter((p: Physiotherapist) => p.is_active && p.is_available))
        }
        setLoading(false)
      } catch (err) {
        console.error('[v0] Error fetching physios:', err)
        setLoading(false)
      }
    }

    fetchPhysios()
    
    // Re-fetch every 15 seconds for real-time updates
    const interval = setInterval(fetchPhysios, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleBookPhysio = (physio: Physiotherapist) => {
    if (physio.phone) {
      window.open(`tel:${physio.phone}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ফিরে যান
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ফিজিওথেরাপি সেবা</h1>
            <p className="text-teal-100 text-sm">বিশেষজ্ঞ থেরাপিস্ট বুক করুন</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600"></div>
          </div>
        ) : physios.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">এখন কোনো ফিজিওথেরাপিস্ট উপলব্ধ নেই</p>
          </div>
        ) : (
          physios.map(physio => (
            <div key={physio.id} className="bg-white rounded-xl border border-teal-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900">{physio.name}</h3>
                {physio.specialization && (
                  <p className="text-sm text-gray-500">বিশেষত্ব: {physio.specialization}</p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {physio.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-teal-600" />
                    {physio.phone}
                  </div>
                )}

                {physio.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    {physio.address}
                  </div>
                )}

                {physio.experience_years && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-teal-600" />
                    অভিজ্ঞতা: {physio.experience_years} বছর
                  </div>
                )}

                {physio.qualification && (
                  <p className="text-sm text-gray-600">যোগ্যতা: {physio.qualification}</p>
                )}

                {physio.consultation_fee && (
                  <p className="text-sm font-semibold text-teal-600">পরামর্শ ফি: ৳{physio.consultation_fee}</p>
                )}
              </div>

              <Button 
                onClick={() => handleBookPhysio(physio)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                যোগাযোগ করুন
              </Button>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
