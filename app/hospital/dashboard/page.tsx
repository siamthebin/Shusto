'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Phone, MapPin, Mail, Building2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

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
  const [hospital, setHospital] = useState<HospitalData | null>(null)
  const [bookings, setBookings] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHospitalData()
  }, [])

  const loadHospitalData = async () => {
    try {
      const hospitalEmail = localStorage.getItem('hospitalEmail')
      const response = await fetch("/api/hospital/profile", {
        headers: {
          'x-hospital-email': hospitalEmail || ''
        }
      })
      if (!response.ok) {
        console.log('[v0] Profile API failed, checking localStorage')
        const hospitalData = localStorage.getItem('hospitalData')
        if (hospitalData) {
          const data = JSON.parse(hospitalData)
          setHospital(data)
          if (data.id) fetchBookings(data.id)
          setLoading(false)
          return
        }
        router.push("/")
        return
      }
      const data = await response.json()
      setHospital(data.hospital)
      if (data.hospital?.id) {
        fetchBookings(data.hospital.id)
      }
    } catch (error) {
      console.error("[v0] Error loading hospital data:", error)
      const hospitalData = localStorage.getItem('hospitalData')
      if (hospitalData) {
        const data = JSON.parse(hospitalData)
        setHospital(data)
        if (data.id) fetchBookings(data.id)
        setLoading(false)
        return
      }
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async (hospitalId: string) => {
    try {
      const response = await fetch(`/api/hospital/orders?hospitalId=${hospitalId}`)
      const data = await response.json()
      if (data.orders) {
        setBookings(data.orders)
      }
    } catch (err) {
      console.error('[v0] Error fetching bookings:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hospitalEmail')
    localStorage.removeItem('hospitalData')
    router.push('/hospital/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">আপনি হাসপাতাল হিসেবে নিবন্ধিত নন</p>
          <Link href="/">
            <Button>হোম এ ফিরে যান</Button>
          </Link>
        </div>
      </div>
    )
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
          
          {bookings.length === 0 ? (
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
