'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Phone, MapPin, Mail } from 'lucide-react'

interface PhysioData {
  id: string
  name: string
  email: string
  phone: string
  address: string
  specialization?: string
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  status: string
  created_at: string
}

export default function PhysioDashboard() {
  const router = useRouter()
  const [physio, setPhysio] = useState<PhysioData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPhysioData()
  }, [router])

  const loadPhysioData = async () => {
    try {
      const physioEmail = localStorage.getItem('physioEmail')
      const response = await fetch("/api/physio/profile", {
        headers: {
          'x-physio-email': physioEmail || ''
        }
      })
      if (!response.ok) {
        const physioData = localStorage.getItem('physioData')
        if (physioData) {
          const data = JSON.parse(physioData)
          setPhysio(data)
          if (data.id) fetchOrders(data.id)
          setLoading(false)
          return
        }
        router.push("/")
        return
      }
      const data = await response.json()
      setPhysio(data.physio)
      if (data.physio?.id) {
        fetchOrders(data.physio.id)
      }
    } catch (error) {
      console.error("[v0] Error loading physio data:", error)
      const physioData = localStorage.getItem('physioData')
      if (physioData) {
        const data = JSON.parse(physioData)
        setPhysio(data)
        if (data.id) fetchOrders(data.id)
        setLoading(false)
        return
      }
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async (physioId: string) => {
    try {
      const response = await fetch(`/api/physio/orders?physioId=${physioId}`)
      const data = await response.json()
      
      if (data.orders) {
        setOrders(data.orders)
      }
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching orders:', err)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('physioEmail')
    localStorage.removeItem('physioData')
    router.push('/physio/login')
  }

  if (!physio) {
    return <div className="flex items-center justify-center min-h-screen">লোড হচ্ছে...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{physio.name}</h1>
            <p className="text-teal-100">{physio.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 px-4 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            লগআউট
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">থেরাপিস্টের তথ্য</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-teal-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">যোগাযোগ</p>
                <p className="font-semibold">{physio.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">ঠিকানা</p>
                <p className="font-semibold">{physio.address || 'N/A'}</p>
              </div>
            </div>
            {physio.specialization && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">বিশেষত্ব</p>
                  <p className="font-semibold">{physio.specialization}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">রোগীর বুকিং</h2>
          
          {loading ? (
            <p className="text-gray-600">লোড হচ্ছে...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">কোনো বুকিং পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
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
                    <p className="font-semibold text-teal-600">৳{order.total_amount}</p>
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
