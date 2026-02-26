'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, MapPin, Truck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/kokonutui/bottom-nav'

interface Ambulance {
  id: string
  name: string
  email: string
  phone: string
  driver_name?: string
  vehicle_number?: string
  vehicle_type?: string
  service_area?: string
  address?: string
  is_active?: boolean
  is_available?: boolean
}

export default function AmbulancesPage() {
  const router = useRouter()
  const [ambulances, setAmbulances] = useState<Ambulance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        console.log('[v0] Fetching ambulances from API...')
        const response = await fetch('/api/admin/ambulances')
        const data = await response.json()
        console.log('[v0] Ambulances received:', data.ambulances?.length || 0)
        
        if (data.ambulances) {
          setAmbulances(data.ambulances.filter((a: Ambulance) => a.is_active && a.is_available))
        }
        setLoading(false)
      } catch (err) {
        console.error('[v0] Error fetching ambulances:', err)
        setLoading(false)
      }
    }

    fetchAmbulances()
    
    // Re-fetch every 15 seconds for real-time updates
    const interval = setInterval(fetchAmbulances, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleCallAmbulance = (ambulance: Ambulance) => {
    if (ambulance.phone) {
      window.open(`tel:${ambulance.phone}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ফিরে যান
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">অ্যাম্বুলেন্স সেবা</h1>
            <p className="text-red-100 text-sm">জরুরি যানবাহন বুক করুন</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
          </div>
        ) : ambulances.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">এখন কোনো অ্যাম্বুলেন্স উপলব্ধ নেই</p>
          </div>
        ) : (
          ambulances.map(ambulance => (
            <div key={ambulance.id} className="bg-white rounded-xl border border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900">{ambulance.name}</h3>
                {ambulance.vehicle_type && (
                  <p className="text-sm text-gray-500">ধরন: {ambulance.vehicle_type}</p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {ambulance.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-red-600" />
                    {ambulance.phone}
                  </div>
                )}

                {ambulance.service_area && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-red-600" />
                    সেবা এলাকা: {ambulance.service_area}
                  </div>
                )}

                {ambulance.driver_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-red-600" />
                    চালক: {ambulance.driver_name}
                  </div>
                )}

                {ambulance.vehicle_number && (
                  <p className="text-sm text-gray-600">গাড়ির নম্বর: {ambulance.vehicle_number}</p>
                )}
              </div>

              <Button 
                onClick={() => handleCallAmbulance(ambulance)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                এখনই কল করুন
              </Button>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
