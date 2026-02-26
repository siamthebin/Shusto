'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Phone, MapPin, Mail, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { protectDashboard } from '@/lib/dashboard-protection'

interface HospitalData {
  id: string
  name: string
  email: string
  phone: string
  address: string
  emergency_number?: string
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  status: string
  created_at: string
}

export default function HospitalDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [hospital, setHospital] = useState<HospitalData | null>(null)
  const [bookings, setBookings] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHospitalData = async () => {
      try {
        console.log('[v0] Hospital Dashboard: Verifying access...')
        
        // Protect dashboard - only allow the logged-in hospital owner
        const protection = await protectDashboard('hospital')
        
        if (!protection.isAuthorized) {
          console.error('[v0] Hospital Dashboard: Access denied -', protection.error)
          setError(protection.error || 'অ্যাক্সেস অস্বীকৃত')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }

        if (!protection.provider) {
          setError('হাসপাতাল তথ্য খুঁজে পাওয়া যায়নি')
          return
        }

        console.log('[v0] Hospital Dashboard: Access granted for', protection.provider.name)
        setHospital({
          id: protection.provider.id,
          name: protection.provider.name,
          email: protection.provider.email,
          phone: '',
          address: '',
        })
        
        await fetchBookings(protection.provider.id)
      } catch (err) {
        console.error('[v0] Hospital Dashboard Error:', err)
        setError('ড্যাশবোর্ড লোড করতে ত্রুটি হয়েছে')
        setLoading(false)
      }
    }

    loadHospitalData()
  }, [router, supabase])

  const fetchBookings = async (hospitalId: string) => {
    try {
      console.log('[v0] Fetching bookings for hospital:', hospitalId)
      const response = await fetch(`/api/hospital/orders?hospitalId=${hospitalId}`)
      const data = await response.json()
      console.log('[v0] Bookings received:', data.orders?.length || 0)
      
      if (data.orders) {
        setBookings(data.orders)
      }
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching bookings:', err)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('hospitalEmail')
    localStorage.removeItem('hospitalData')
    router.push('/hospital/login')
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">অ্যাক্সেস অস্বীকৃত</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            লগইন পেজে যান
          </button>
        </div>
      </div>
    )
  }

  if (loading || !hospital) {
    return <div className="flex items-center justify-center min-h-screen">লোড হচ্ছে...</div>
  }

  if (!hospital) {
    return <div className="flex items-center justify-center min-h-screen">লোড হচ্ছে...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{hospital.name}</h1>
            <p className="text-emerald-100">{hospital.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            লগআউট
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Hospital Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">হাসপাতালের তথ্য</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">যোগাযোগ</p>
                <p className="font-semibold">{hospital.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">ঠিকানা</p>
                <p className="font-semibold">{hospital.address || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">ইমেইল</p>
                <p className="font-semibold">{hospital.email}</p>
              </div>
            </div>
            {hospital.emergency_number && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-red-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">জরুরি নম্বর</p>
                  <p className="font-semibold">{hospital.emergency_number}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders/Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">রোগীর বুকিং</h2>
          
          {loading ? (
            <p className="text-gray-600">লোড হচ্ছে...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">কোনো বুকিং এখনো পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'অপেক্ষমান' :
                       order.status === 'confirmed' ? 'নিশ্চিত' : order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('bn-BD')}
                    </p>
                    <p className="font-semibold text-emerald-600">৳{order.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
